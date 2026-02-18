import { Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper } from '../utils/response.js';

interface StudentRow extends RowDataPacket {
  student_id: number;
  clerk_id: string;
  is_admin: boolean;
}

/**
 * GET /api/payments
 * Students see their own payments
 * Admin sees all
 */
export const getPayments = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const clerkId = req.user?.clerkId;

    if (!clerkId) {
      return ResponseHelper.badRequest(res, 'User not authenticated');
    }

    // Fetch student
    const [students] = await pool.query<StudentRow[]>(
      'SELECT student_id, is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!students.length) {
      return ResponseHelper.notFound(res, 'Student');
    }

    const student = students[0];

    let query = `
      SELECT p.*, s.name AS student_name, s.roll_no,
             f.amount AS fee_amount, h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
    `;

    const params: any[] = [];

    if (!student.is_admin) {
      query += ' WHERE p.student_id = ?';
      params.push(student.student_id);
    }

    query += ' ORDER BY p.payment_date DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return ResponseHelper.success(res, 'Payments retrieved successfully', rows);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch payments', 500, (error as Error).message);
  }
};

/**
 * POST /api/payments
 * Admin only
 */
export const createPayment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const clerkId = req.user?.clerkId;

    if (!clerkId) {
      return ResponseHelper.badRequest(res, 'User not authenticated');
    }

    // Verify admin
    const [admins] = await pool.query<StudentRow[]>(
      'SELECT is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!admins.length || !admins[0].is_admin) {
      return ResponseHelper.badRequest(res, 'Admin access required');
    }

    const { student_id, fee_id, mode } = req.body;

    if (!student_id || !fee_id || !mode) {
      return ResponseHelper.badRequest(res, 'All fields are required');
    }

    const validModes = ['UPI', 'Card', 'Cash', 'NetBanking'];
    if (!validModes.includes(mode)) {
      return ResponseHelper.badRequest(res, 'Invalid payment mode');
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Payment (student_id, fee_id, payment_date, mode, status)
       VALUES (?, ?, NOW(), ?, 'Pending')`,
      [student_id, fee_id, mode]
    );

    return ResponseHelper.created(res, 'Payment created successfully', {
      payment_id: result.insertId
    });

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to create payment', 500, (error as Error).message);
  }
};

/**
 * PUT /api/payments/:id
 * Admin only
 */
export const updatePayment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const clerkId = req.user?.clerkId;

    const [admins] = await pool.query<StudentRow[]>(
      'SELECT is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!admins.length || !admins[0].is_admin) {
      return ResponseHelper.badRequest(res, 'Admin access required');
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validStatuses.includes(status)) {
      return ResponseHelper.badRequest(res, 'Invalid status');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Payment SET status = ? WHERE payment_id = ?',
      [status, id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Payment');
    }

    return ResponseHelper.success(res, 'Payment updated successfully');

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to update payment', 500, (error as Error).message);
  }
};

export const getPayment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const clerkId = req.user?.clerkId;
    const { id } = req.params;

    if (!clerkId) {
      return ResponseHelper.badRequest(res, 'User not authenticated');
    }

    const [students] = await pool.query<StudentRow[]>(
      'SELECT student_id, is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!students.length) {
      return ResponseHelper.notFound(res, 'Student');
    }

    const student = students[0];

    let query = `
      SELECT p.*, s.name AS student_name, s.roll_no,
             f.amount AS fee_amount, h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE p.payment_id = ?
    `;

    const params: any[] = [id];

    if (!student.is_admin) {
      query += ' AND p.student_id = ?';
      params.push(student.student_id);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    if (!rows.length) {
      return ResponseHelper.notFound(res, 'Payment');
    }

    return ResponseHelper.success(res, 'Payment retrieved successfully', rows[0]);

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch payment', 500, (error as Error).message);
  }
};
/**
 * DELETE /api/payments/:id
 * Admin only
 */
export const deletePayment = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const clerkId = req.user?.clerkId;

    const [admins] = await pool.query<StudentRow[]>(
      'SELECT is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!admins.length || !admins[0].is_admin) {
      return ResponseHelper.badRequest(res, 'Admin access required');
    }

    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Payment WHERE payment_id = ?',
      [id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Payment');
    }

    return ResponseHelper.success(res, 'Payment deleted successfully');

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to delete payment', 500, (error as Error).message);
  }
};
