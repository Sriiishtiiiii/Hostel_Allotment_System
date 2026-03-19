import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  sendBatchActivationEmail,
  sendAllotmentConfirmationEmail,
  sendUnresolvedAllotmentEmail,
} from '../services/emailService.js';

// GET /api/rounds  (admin)
export const listRounds = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rounds] = await pool.execute(`
      SELECT
        ar.*,
        COUNT(DISTINCT rs.student_id) AS total_students,
        SUM(CASE WHEN rp.pref_id IS NOT NULL THEN 1 ELSE 0 END) AS submitted_count,
        SUM(CASE WHEN rp.status = 'Allotted' THEN 1 ELSE 0 END) AS allotted_count
      FROM AllotmentRound ar
      LEFT JOIN RoundStudent rs ON rs.round_id = ar.round_id
      LEFT JOIN RoomPreference rp ON rp.round_id = ar.round_id AND rp.student_id = rs.student_id
      GROUP BY ar.round_id
      ORDER BY ar.round_number DESC
    `);
    res.json({ success: true, message: 'Rounds fetched', data: rounds });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rounds  (admin)
export const createRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const batch_size = parseInt(req.body.batch_size) || 5;
  const academic_year = parseInt(req.body.academic_year);
  const window_hours = parseInt(req.body.window_hours) || 24;

  if (!academic_year || isNaN(academic_year)) {
    res.status(400).json({ success: false, message: 'academic_year is required' });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Next round number for this academic year
    const [existing] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM AllotmentRound WHERE academic_year = ?',
      [academic_year]
    ) as any[];
    const round_number = Number(existing[0].cnt) + 1;

    console.log('[createRound] values:', { round_number, academic_year, batch_size, window_hours, types: [typeof round_number, typeof academic_year, typeof batch_size, typeof window_hours] });

    // Create the round record
    // NOTE: all values explicitly cast to Number to avoid mysql2 BigInt issues
    const [result] = await conn.execute(
      'INSERT INTO AllotmentRound (round_number, academic_year, batch_size, window_hours) VALUES (?, ?, ?, ?)',
      [round_number, academic_year, batch_size, window_hours]
    ) as any[];
    const round_id = result.insertId as number;

    // Pick top N eligible students:
    //   - not admin, email verified, has CGPA
    //   - no active allotment
    //   - not already in an Upcoming or Active round
    const [students] = await conn.execute(`
      SELECT s.student_id FROM Student s
      WHERE s.is_admin = FALSE
        AND s.email_verified = TRUE
        AND s.cgpa IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM Allotment a
          WHERE a.student_id = s.student_id AND a.status = 'Active'
        )
        AND NOT EXISTS (
          SELECT 1 FROM RoundStudent rs2
          JOIN AllotmentRound ar2 ON ar2.round_id = rs2.round_id
          WHERE rs2.student_id = s.student_id
            AND ar2.status IN ('Upcoming', 'Active')
        )
      ORDER BY s.cgpa DESC
      LIMIT ${batch_size}
    `) as any[];

    const studentList = students as any[];

    if (studentList.length > 0) {
      const placeholders = studentList.map(() => '(?, ?)').join(', ');
      const values = studentList.flatMap((s: any) => [round_id, s.student_id]);
      await conn.execute(
        `INSERT INTO RoundStudent (round_id, student_id) VALUES ${placeholders}`,
        values
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: `Round ${round_number} created with ${studentList.length} students`,
      data: { round_id, round_number, assigned_count: studentList.length },
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[createRound] ERROR:', err.message, err.code, err.sqlMessage);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// POST /api/rounds/:id/activate  (admin)
export const activateRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const round_id = parseInt(req.params.id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      'SELECT * FROM AllotmentRound WHERE round_id = ?',
      [round_id]
    ) as any[];
    const round = (rows as any[])[0];

    if (!round) {
      res.status(404).json({ success: false, message: 'Round not found' });
      return;
    }
    if (round.status !== 'Upcoming') {
      res.status(400).json({ success: false, message: `Round is already ${round.status}` });
      return;
    }

    const activated_at = new Date();
    await conn.execute(
      "UPDATE AllotmentRound SET status = 'Active', activated_at = ? WHERE round_id = ?",
      [activated_at, round_id]
    );

    await conn.execute(
      'UPDATE RoundStudent SET notified = TRUE WHERE round_id = ?',
      [round_id]
    );

    // Fetch students to email
    const [students] = await conn.execute(`
      SELECT s.name, s.email
      FROM RoundStudent rs
      JOIN Student s ON s.student_id = rs.student_id
      WHERE rs.round_id = ?
    `, [round_id]) as any[];

    await conn.commit();

    // Calculate deadline string for email
    const deadline = new Date(activated_at.getTime() + round.window_hours * 60 * 60 * 1000);
    const deadlineStr = deadline.toISOString();

    // Send emails (outside transaction; individual failures are non-fatal)
    await Promise.allSettled(
      (students as any[]).map((s: any) =>
        sendBatchActivationEmail(s.email, s.name, round.round_number, deadlineStr).catch(
          (err) => console.error(`Email failed for ${s.email}:`, err)
        )
      )
    );

    res.json({
      success: true,
      message: `Round ${round.round_number} activated. Emails sent to ${(students as any[]).length} students.`,
      data: { round_id, deadline: deadlineStr, notified: (students as any[]).length },
    });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// GET /api/rounds/:id/students  (admin)
export const getRoundStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const round_id = parseInt(req.params.id);
  try {
    const [students] = await pool.execute(`
      SELECT
        s.student_id, s.name, s.roll_no, s.cgpa, s.department, s.gender, s.email,
        rs.notified,
        (rp.pref_id IS NOT NULL) AS has_submitted,
        rp.status AS pref_status,
        rp.allotted_room_id,
        r.room_number AS allotted_room_number,
        h.hostel_name AS allotted_hostel
      FROM RoundStudent rs
      JOIN Student s ON s.student_id = rs.student_id
      LEFT JOIN RoomPreference rp ON rp.student_id = rs.student_id AND rp.round_id = rs.round_id
      LEFT JOIN Room r ON r.room_id = rp.allotted_room_id
      LEFT JOIN Hostel h ON h.hostel_id = r.hostel_id
      WHERE rs.round_id = ?
      ORDER BY s.cgpa DESC
    `, [round_id]) as any[];

    res.json({ success: true, message: 'Students fetched', data: students });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/rounds/:id/process  (admin)
export const processRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const round_id = parseInt(req.params.id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validate round
    const [roundRows] = await conn.execute(
      'SELECT * FROM AllotmentRound WHERE round_id = ?',
      [round_id]
    ) as any[];
    const round = (roundRows as any[])[0];

    if (!round) {
      res.status(404).json({ success: false, message: 'Round not found' });
      return;
    }
    if (round.status !== 'Active') {
      res.status(400).json({ success: false, message: `Round is ${round.status}, must be Active to process` });
      return;
    }

    // Load all Pending preferences with student CGPA
    const [prefs] = await conn.execute(`
      SELECT
        rp.pref_id, rp.student_id,
        rp.priority_1_room_id, rp.priority_2_room_id, rp.priority_3_room_id,
        rp.priority_4_room_id, rp.priority_5_room_id,
        s.cgpa, s.name, s.email
      FROM RoomPreference rp
      JOIN Student s ON s.student_id = rp.student_id
      WHERE rp.round_id = ? AND rp.status = 'Pending'
    `, [round_id]) as any[];

    const prefList = prefs as any[];

    // Collect all room IDs mentioned in preferences
    const roomIdSet = new Set<number>();
    for (const p of prefList) {
      if (p.priority_1_room_id) roomIdSet.add(p.priority_1_room_id);
      if (p.priority_2_room_id) roomIdSet.add(p.priority_2_room_id);
      if (p.priority_3_room_id) roomIdSet.add(p.priority_3_room_id);
      if (p.priority_4_room_id) roomIdSet.add(p.priority_4_room_id);
      if (p.priority_5_room_id) roomIdSet.add(p.priority_5_room_id);
    }
    const roomIds = [...roomIdSet];

    // Load room capacities and current occupancy from previous rounds
    const roomSlots = new Map<number, number>();
    if (roomIds.length > 0) {
      const ph = roomIds.map(() => '?').join(', ');
      const [roomRows] = await conn.execute(`
        SELECT
          r.room_id, r.capacity,
          COUNT(CASE WHEN a.status = 'Active' THEN a.allotment_id END) AS current_occupancy
        FROM Room r
        LEFT JOIN Allotment a ON a.room_id = r.room_id AND a.status = 'Active'
        WHERE r.room_id IN (${ph})
        GROUP BY r.room_id
      `, roomIds) as any[];

      for (const r of roomRows as any[]) {
        roomSlots.set(r.room_id, Math.max(0, r.capacity - (Number(r.current_occupancy) || 0)));
      }
    }

    // --- Allotment algorithm ---
    // allotted: student_id → room_id
    const allotted = new Map<number, number>();

    for (const priorityKey of ['priority_1_room_id', 'priority_2_room_id', 'priority_3_room_id', 'priority_4_room_id', 'priority_5_room_id']) {
      // Only process students not yet allotted
      const unallotted = prefList.filter((p: any) => !allotted.has(p.student_id));

      // Group unallotted by their room for this priority
      const roomGroups = new Map<number, any[]>();
      for (const p of unallotted) {
        const roomId = p[priorityKey];
        if (!roomId) continue;
        if (!roomGroups.has(roomId)) roomGroups.set(roomId, []);
        roomGroups.get(roomId)!.push(p);
      }

      // Fill each room: sort by CGPA desc, allot up to remaining slots
      for (const [roomId, students] of roomGroups) {
        const slots = roomSlots.get(roomId) ?? 0;
        if (slots <= 0) continue;
        students.sort((a: any, b: any) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
        const winners = students.slice(0, slots);
        for (const s of winners) {
          allotted.set(s.student_id, roomId);
        }
        roomSlots.set(roomId, slots - winners.length);
      }
    }

    // Students still unallotted after all 3 priorities → Unresolved
    const unresolvedPrefs = prefList.filter((p: any) => !allotted.has(p.student_id));

    // --- Write to DB ---

    // 1. Batch insert Allotment rows
    if (allotted.size > 0) {
      const entries = [...allotted.entries()];
      const ph = entries.map(() => '(?, ?)').join(', ');
      const vals = entries.flatMap(([sid, rid]) => [sid, rid]);
      await conn.execute(`INSERT INTO Allotment (student_id, room_id) VALUES ${ph}`, vals);
    }

    // 2. Update RoomPreference for allotted students
    for (const [studentId, roomId] of allotted.entries()) {
      await conn.execute(
        "UPDATE RoomPreference SET status = 'Allotted', allotted_room_id = ? WHERE student_id = ? AND round_id = ?",
        [roomId, studentId, round_id]
      );
    }

    // 3. Mark unresolved
    if (unresolvedPrefs.length > 0) {
      const ph = unresolvedPrefs.map(() => '?').join(', ');
      const ids = unresolvedPrefs.map((p: any) => p.student_id);
      await conn.execute(
        `UPDATE RoomPreference SET status = 'Unresolved' WHERE round_id = ? AND student_id IN (${ph})`,
        [round_id, ...ids]
      );
    }

    // 4. Mark round Completed
    await conn.execute(
      "UPDATE AllotmentRound SET status = 'Completed', processed_at = NOW() WHERE round_id = ?",
      [round_id]
    );

    // Gather email data before releasing connection
    const allottedIds = [...allotted.keys()];
    let allottedEmailData: any[] = [];
    if (allottedIds.length > 0) {
      const ph = allottedIds.map(() => '?').join(', ');
      const [rows] = await conn.execute(`
        SELECT s.name, s.email, r.room_number, r.floor, r.room_type, h.hostel_name
        FROM Allotment a
        JOIN Student s ON s.student_id = a.student_id
        JOIN Room r ON r.room_id = a.room_id
        JOIN Hostel h ON h.hostel_id = r.hostel_id
        WHERE a.student_id IN (${ph}) AND a.status = 'Active'
      `, allottedIds) as any[];
      allottedEmailData = rows as any[];
    }

    await conn.commit();

    // Send emails outside transaction
    const emailJobs: Promise<any>[] = [
      ...allottedEmailData.map((d: any) =>
        sendAllotmentConfirmationEmail(d.email, d.name, d.hostel_name, d.room_number, d.floor, d.room_type)
          .catch((err) => console.error(`Email failed for ${d.email}:`, err))
      ),
      ...unresolvedPrefs.map((p: any) =>
        sendUnresolvedAllotmentEmail(p.email, p.name)
          .catch((err: any) => console.error(`Email failed for ${p.email}:`, err))
      ),
    ];
    await Promise.allSettled(emailJobs);

    res.json({
      success: true,
      message: `Round processed. ${allotted.size} allotted, ${unresolvedPrefs.length} unresolved.`,
      data: {
        round_id,
        allotted: allotted.size,
        unresolved: unresolvedPrefs.length,
        no_preference: 0,
      },
    });
  } catch (err: any) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// POST /api/rounds/:id/process-and-advance  (admin)
// Processes the current round then automatically creates + activates the next batch
export const processAndAdvance = async (req: AuthRequest, res: Response): Promise<void> => {
  const round_id = parseInt(req.params.id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ── 1. Load and validate the round ──────────────────────────────────────
    const [roundRows] = await conn.execute(
      'SELECT * FROM AllotmentRound WHERE round_id = ?', [round_id]
    ) as any[];
    const round = (roundRows as any[])[0];

    if (!round) { res.status(404).json({ success: false, message: 'Round not found' }); return; }
    if (round.status !== 'Active') {
      res.status(400).json({ success: false, message: `Round is ${round.status}, must be Active` });
      return;
    }

    // ── 2. Run the same allotment algorithm as processRound ──────────────────
    const [prefs] = await conn.execute(`
      SELECT rp.pref_id, rp.student_id,
        rp.priority_1_room_id, rp.priority_2_room_id, rp.priority_3_room_id,
        rp.priority_4_room_id, rp.priority_5_room_id,
        s.cgpa, s.name, s.email
      FROM RoomPreference rp
      JOIN Student s ON s.student_id = rp.student_id
      WHERE rp.round_id = ? AND rp.status = 'Pending'
    `, [round_id]) as any[];
    const prefList = prefs as any[];

    const roomIdSet = new Set<number>();
    for (const p of prefList) {
      for (const key of ['priority_1_room_id','priority_2_room_id','priority_3_room_id','priority_4_room_id','priority_5_room_id']) {
        if (p[key]) roomIdSet.add(p[key]);
      }
    }
    const roomIds = [...roomIdSet];
    const roomSlots = new Map<number, number>();
    if (roomIds.length > 0) {
      const ph = roomIds.map(() => '?').join(', ');
      const [roomRows] = await conn.execute(`
        SELECT r.room_id, r.capacity,
          COUNT(CASE WHEN a.status = 'Active' THEN a.allotment_id END) AS current_occupancy
        FROM Room r
        LEFT JOIN Allotment a ON a.room_id = r.room_id AND a.status = 'Active'
        WHERE r.room_id IN (${ph})
        GROUP BY r.room_id
      `, roomIds) as any[];
      for (const r of roomRows as any[]) {
        roomSlots.set(r.room_id, Math.max(0, r.capacity - (Number(r.current_occupancy) || 0)));
      }
    }

    const allotted = new Map<number, number>();
    for (const priorityKey of ['priority_1_room_id','priority_2_room_id','priority_3_room_id','priority_4_room_id','priority_5_room_id']) {
      const unallotted = prefList.filter((p: any) => !allotted.has(p.student_id));
      const roomGroups = new Map<number, any[]>();
      for (const p of unallotted) {
        const roomId = p[priorityKey];
        if (!roomId) continue;
        if (!roomGroups.has(roomId)) roomGroups.set(roomId, []);
        roomGroups.get(roomId)!.push(p);
      }
      for (const [roomId, students] of roomGroups) {
        const slots = roomSlots.get(roomId) ?? 0;
        if (slots <= 0) continue;
        students.sort((a: any, b: any) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
        const winners = students.slice(0, slots);
        for (const s of winners) allotted.set(s.student_id, roomId);
        roomSlots.set(roomId, slots - winners.length);
      }
    }
    const unresolvedPrefs = prefList.filter((p: any) => !allotted.has(p.student_id));

    // Write allotments
    if (allotted.size > 0) {
      const entries = [...allotted.entries()];
      const ph = entries.map(() => '(?, ?)').join(', ');
      await conn.execute(`INSERT INTO Allotment (student_id, room_id) VALUES ${ph}`, entries.flatMap(([sid, rid]) => [sid, rid]));
      for (const [studentId, roomId] of allotted.entries()) {
        await conn.execute(
          "UPDATE RoomPreference SET status = 'Allotted', allotted_room_id = ? WHERE student_id = ? AND round_id = ?",
          [roomId, studentId, round_id]
        );
      }
    }
    if (unresolvedPrefs.length > 0) {
      const ph = unresolvedPrefs.map(() => '?').join(', ');
      await conn.execute(
        `UPDATE RoomPreference SET status = 'Unresolved' WHERE round_id = ? AND student_id IN (${ph})`,
        [round_id, ...unresolvedPrefs.map((p: any) => p.student_id)]
      );
    }
    await conn.execute(
      "UPDATE AllotmentRound SET status = 'Completed', processed_at = NOW() WHERE round_id = ?",
      [round_id]
    );

    // ── 3. Create + activate next batch ─────────────────────────────────────
    const batch_size = Number(round.batch_size);
    const academic_year = Number(round.academic_year);

    const [cntRows] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM AllotmentRound WHERE academic_year = ?', [academic_year]
    ) as any[];
    const next_round_number = Number(cntRows[0].cnt) + 1;

    const [nextStudents] = await conn.execute(`
      SELECT s.student_id FROM Student s
      WHERE s.is_admin = FALSE
        AND s.email_verified = TRUE
        AND s.cgpa IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM Allotment a WHERE a.student_id = s.student_id AND a.status = 'Active')
        AND NOT EXISTS (
          SELECT 1 FROM RoundStudent rs2
          JOIN AllotmentRound ar2 ON ar2.round_id = rs2.round_id
          WHERE rs2.student_id = s.student_id AND ar2.status IN ('Upcoming', 'Active')
        )
      ORDER BY s.cgpa DESC
      LIMIT ${batch_size}
    `) as any[];
    const nextList = nextStudents as any[];

    let next_round_id: number | null = null;
    if (nextList.length > 0) {
      const [ins] = await conn.execute(
        'INSERT INTO AllotmentRound (round_number, academic_year, batch_size, window_hours, status, activated_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [next_round_number, academic_year, batch_size, round.window_hours, 'Active']
      ) as any[];
      next_round_id = ins.insertId as number;

      const ph = nextList.map(() => '(?, ?)').join(', ');
      await conn.execute(
        `INSERT INTO RoundStudent (round_id, student_id) VALUES ${ph}`,
        nextList.flatMap((s: any) => [next_round_id, s.student_id])
      );
      await conn.execute('UPDATE RoundStudent SET notified = TRUE WHERE round_id = ?', [next_round_id]);
    }

    await conn.commit();

    // ── 4. Emails (outside transaction) ─────────────────────────────────────
    const allottedIds = [...allotted.keys()];
    if (allottedIds.length > 0) {
      const ph = allottedIds.map(() => '?').join(', ');
      const [emailRows] = await pool.execute(`
        SELECT s.name, s.email, r.room_number, r.floor, r.room_type, h.hostel_name
        FROM Allotment a JOIN Student s ON s.student_id = a.student_id
        JOIN Room r ON r.room_id = a.room_id JOIN Hostel h ON h.hostel_id = r.hostel_id
        WHERE a.student_id IN (${ph}) AND a.status = 'Active'
      `, allottedIds) as any[];
      await Promise.allSettled((emailRows as any[]).map((d: any) =>
        sendAllotmentConfirmationEmail(d.email, d.name, d.hostel_name, d.room_number, d.floor, d.room_type)
          .catch(() => {})
      ));
    }
    if (next_round_id && nextList.length > 0) {
      const deadline = new Date(Date.now() + round.window_hours * 3600 * 1000).toISOString();
      const [nStudents] = await pool.execute(
        `SELECT s.name, s.email FROM RoundStudent rs JOIN Student s ON s.student_id = rs.student_id WHERE rs.round_id = ?`,
        [next_round_id]
      ) as any[];
      await Promise.allSettled((nStudents as any[]).map((s: any) =>
        sendBatchActivationEmail(s.email, s.name, next_round_number, deadline).catch(() => {})
      ));
    }

    res.json({
      success: true,
      message: `Round ${round.round_number} processed. ${allotted.size} allotted. ${nextList.length > 0 ? `Round ${next_round_number} auto-started with ${nextList.length} students.` : 'No more eligible students — all done!'}`,
      data: {
        processed: { round_id, allotted: allotted.size, unresolved: unresolvedPrefs.length },
        next_round: next_round_id ? { round_id: next_round_id, round_number: next_round_number, students: nextList.length } : null,
      },
    });
  } catch (err: any) {
    await conn.rollback();
    console.error('[processAndAdvance] ERROR:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// GET /api/rounds/:id/results  (admin)
export const getRoundResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const round_id = parseInt(req.params.id);
  try {
    const [results] = await pool.execute(`
      SELECT
        s.name, s.roll_no, s.cgpa, s.department,
        rp.status AS pref_status,
        r.room_number, r.floor, r.room_type,
        h.hostel_name
      FROM RoomPreference rp
      JOIN Student s ON s.student_id = rp.student_id
      LEFT JOIN Room r ON r.room_id = rp.allotted_room_id
      LEFT JOIN Hostel h ON h.hostel_id = r.hostel_id
      WHERE rp.round_id = ?
      ORDER BY rp.status, s.cgpa DESC
    `, [round_id]) as any[];

    res.json({ success: true, message: 'Results fetched', data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rounds/my-status  (student — must be registered before /:id)
export const getMyRoundStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const student_id = req.user!.student_id;
  try {
    // Find the most recent Upcoming or Active round this student is in
    const [rows] = await pool.execute(`
      SELECT
        ar.round_id, ar.round_number, ar.status,
        ar.activated_at, ar.window_hours,
        (rp.pref_id IS NOT NULL) AS has_submitted,
        rp.status AS pref_status
      FROM RoundStudent rs
      JOIN AllotmentRound ar ON ar.round_id = rs.round_id
      LEFT JOIN RoomPreference rp
        ON rp.student_id = rs.student_id AND rp.round_id = ar.round_id
      WHERE rs.student_id = ? AND ar.status IN ('Upcoming', 'Active')
      ORDER BY ar.created_at DESC
      LIMIT 1
    `, [student_id]) as any[];

    const round = (rows as any[])[0] || null;

    let deadline: string | null = null;
    if (round?.activated_at && round?.window_hours) {
      const d = new Date(round.activated_at);
      d.setHours(d.getHours() + round.window_hours);
      deadline = d.toISOString();
    }

    // Current active allotment
    const [allotments] = await pool.execute(`
      SELECT a.allotment_id, r.room_number, r.floor, r.room_type, h.hostel_name, h.hostel_code
      FROM Allotment a
      JOIN Room r ON r.room_id = a.room_id
      JOIN Hostel h ON h.hostel_id = r.hostel_id
      WHERE a.student_id = ? AND a.status = 'Active'
      LIMIT 1
    `, [student_id]) as any[];

    res.json({
      success: true,
      message: 'Status fetched',
      data: {
        inActiveRound: round?.status === 'Active',
        round: round
          ? {
              round_id: round.round_id,
              round_number: round.round_number,
              status: round.status,
              deadline,
              has_submitted: !!round.has_submitted,
              pref_status: round.pref_status,
            }
          : null,
        currentAllotment: (allotments as any[])[0] || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
