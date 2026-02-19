import { Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

const VALID_CATEGORIES = ['Maintenance', 'Electrical', 'Plumbing', 'Internet', 'Other'];

/**
 * GET /api/complaints
 * Admin: all complaints; Student: only their own
 */
export const getComplaints = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = req.user!;

    let query = `
      SELECT c.complaint_id, c.student_id, c.room_id, c.category, c.description,
             c.raised_date, c.status,
             s.name AS student_name, s.roll_no,
             r.room_number, h.hostel_name
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      LEFT JOIN Room r ON c.room_id = r.room_id
      LEFT JOIN Hostel h ON r.hostel_id = h.hostel_id
    `;

    const params: any[] = [];

    if (!user.is_admin) {
      query += ' WHERE c.student_id = ?';
      params.push(user.student_id);
    }

    query += ' ORDER BY c.raised_date DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return ResponseHelper.success(res, 'Complaints retrieved successfully', rows);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch complaints', 500, (error as Error).message);
  }
};

/**
 * POST /api/complaints
 * Student submits a complaint; room_id auto-detected from active allotment
 */
export const createComplaint = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { category, description } = req.body;
    const student_id = req.user!.student_id;

    if (!VALID_CATEGORIES.includes(category)) {
      return ResponseHelper.badRequest(res, `Invalid category. Valid: ${VALID_CATEGORIES.join(', ')}`);
    }

    if (!description || description.trim().length < 10) {
      return ResponseHelper.badRequest(res, 'Description must be at least 10 characters');
    }

    // Look up the student's current active allotment for room_id
    const [allotments] = await pool.execute<RowDataPacket[]>(
      `SELECT room_id FROM Allotment WHERE student_id = ? AND status = 'Active' LIMIT 1`,
      [student_id]
    );

    const room_id = (allotments[0]?.room_id) ?? null;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Complaint (student_id, room_id, category, description, raised_date, status)
       VALUES (?, ?, ?, ?, NOW(), 'Open')`,
      [student_id, room_id, category, description.trim()]
    );

    return ResponseHelper.created(res, 'Complaint submitted successfully', {
      complaint_id: result.insertId,
    });
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to create complaint', 500, (error as Error).message);
  }
};

/**
 * PUT /api/complaints/:id  (admin only)
 */
export const updateComplaint = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status)) {
      return ResponseHelper.badRequest(res, 'Invalid status');
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE Complaint SET status = ? WHERE complaint_id = ?',
      [status, id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Complaint');
    }

    return ResponseHelper.success(res, 'Complaint updated successfully');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to update complaint', 500, (error as Error).message);
  }
};
