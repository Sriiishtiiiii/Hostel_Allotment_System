import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// POST /api/preferences
export const submitPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  const student_id = req.user!.student_id;
  const { round_id, priority_1, priority_2, priority_3 } = req.body;

  if (!round_id || !priority_1) {
    res.status(400).json({ success: false, message: 'round_id and priority_1 are required' });
    return;
  }

  try {
    // Verify student is in this round and it's Active
    const [roundRows] = await pool.execute(`
      SELECT ar.status, ar.activated_at, ar.window_hours, ar.round_number
      FROM RoundStudent rs
      JOIN AllotmentRound ar ON ar.round_id = rs.round_id
      WHERE rs.student_id = ? AND rs.round_id = ?
    `, [student_id, round_id]) as any[];

    const round = (roundRows as any[])[0];
    if (!round) {
      res.status(403).json({ success: false, message: 'You are not in this round' });
      return;
    }
    if (round.status !== 'Active') {
      res.status(400).json({ success: false, message: `Round is ${round.status}, not accepting preferences` });
      return;
    }

    // Check deadline
    if (round.activated_at && round.window_hours) {
      const deadline = new Date(round.activated_at);
      deadline.setHours(deadline.getHours() + round.window_hours);
      if (new Date() > deadline) {
        res.status(400).json({ success: false, message: 'Preference submission window has closed' });
        return;
      }
    }

    // Validate room gender compatibility for all submitted rooms
    const [studentRows] = await pool.execute(
      'SELECT gender FROM Student WHERE student_id = ?',
      [student_id]
    ) as any[];
    const gender = (studentRows as any[])[0]?.gender;

    const roomIds = [priority_1, priority_2, priority_3].filter(Boolean);
    if (roomIds.length > 0) {
      const placeholders = roomIds.map(() => '?').join(', ');
      const [roomRows] = await pool.execute(`
        SELECT r.room_id, h.type AS hostel_type
        FROM Room r
        JOIN Hostel h ON h.hostel_id = r.hostel_id
        WHERE r.room_id IN (${placeholders})
      `, roomIds) as any[];

      const incompatible = (roomRows as any[]).find((r: any) => {
        if (r.hostel_type === 'Co-ed') return false;
        if (gender === 'Male' && r.hostel_type === 'Girls') return true;
        if (gender === 'Female' && r.hostel_type === 'Boys') return true;
        return false;
      });

      if (incompatible) {
        res.status(400).json({ success: false, message: 'One or more selected rooms are not available for your gender' });
        return;
      }
    }

    // Upsert preference (student can update until deadline)
    await pool.execute(`
      INSERT INTO RoomPreference
        (student_id, round_id, priority_1_room_id, priority_2_room_id, priority_3_room_id, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
      ON DUPLICATE KEY UPDATE
        priority_1_room_id = VALUES(priority_1_room_id),
        priority_2_room_id = VALUES(priority_2_room_id),
        priority_3_room_id = VALUES(priority_3_room_id),
        submitted_at = CURRENT_TIMESTAMP,
        status = 'Pending'
    `, [student_id, round_id, priority_1, priority_2 || null, priority_3 || null]);

    res.json({ success: true, message: 'Preferences submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/preferences/me
export const getMyPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  const student_id = req.user!.student_id;

  try {
    // Get preferences for the most recent round this student is in
    const [rows] = await pool.execute(`
      SELECT
        rp.*,
        ar.round_number, ar.status AS round_status,
        r1.room_number AS p1_room_number, h1.hostel_name AS p1_hostel, r1.floor AS p1_floor,
        r2.room_number AS p2_room_number, h2.hostel_name AS p2_hostel, r2.floor AS p2_floor,
        r3.room_number AS p3_room_number, h3.hostel_name AS p3_hostel, r3.floor AS p3_floor,
        ra.room_number AS allotted_room_number, ha.hostel_name AS allotted_hostel
      FROM RoomPreference rp
      JOIN AllotmentRound ar ON ar.round_id = rp.round_id
      LEFT JOIN Room r1 ON r1.room_id = rp.priority_1_room_id
      LEFT JOIN Hostel h1 ON h1.hostel_id = r1.hostel_id
      LEFT JOIN Room r2 ON r2.room_id = rp.priority_2_room_id
      LEFT JOIN Hostel h2 ON h2.hostel_id = r2.hostel_id
      LEFT JOIN Room r3 ON r3.room_id = rp.priority_3_room_id
      LEFT JOIN Hostel h3 ON h3.hostel_id = r3.hostel_id
      LEFT JOIN Room ra ON ra.room_id = rp.allotted_room_id
      LEFT JOIN Hostel ha ON ha.hostel_id = ra.hostel_id
      WHERE rp.student_id = ?
      ORDER BY rp.submitted_at DESC
      LIMIT 1
    `, [student_id]) as any[];

    res.json({ success: true, message: 'Preferences fetched', data: (rows as any[])[0] || null });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
