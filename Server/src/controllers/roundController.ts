import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendBatchActivationEmail } from '../services/emailService.js';

// GET /api/rounds  (admin)
export const listRounds = async (req: AuthRequest, res: Response): Promise<void> => {
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
  const { batch_size = 20, academic_year, window_hours = 24 } = req.body;

  if (!academic_year) {
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
    const round_number = (existing[0].cnt as number) + 1;

    // Create the round record
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
      LIMIT ?
    `, [batch_size]) as any[];

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
