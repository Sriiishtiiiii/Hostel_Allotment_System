import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  ResponseHelper,
  logRequest,
  logSuccess,
  logError
} from '../utils/response.js';

interface StudentRow extends RowDataPacket {
  student_id: number;
  clerk_id: string;
  name: string;
  roll_no: string;
  department: string;
  academic_year: number;
  gender: string;
  phone: string;
  email: string;
  cgpa: number;
  is_admin: boolean;
  created_at: Date;
}

/**
 * Sync Clerk user to local DB
 */
export const syncUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  logRequest('POST', '/api/auth/sync');

  try {
    const clerkId = req.user?.clerkId;

    if (!clerkId) {
      return ResponseHelper.badRequest(res, 'User not authenticated');
    }

    const {
      name,
      roll_no,
      department,
      academic_year,
      gender,
      phone,
      email
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !roll_no ||
      !department ||
      !academic_year ||
      !gender ||
      !email
    ) {
      return ResponseHelper.badRequest(
        res,
        'Missing required fields'
      );
    }

    // Check if already synced
    const [existing] = await pool.query<StudentRow[]>(
      'SELECT * FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (existing.length > 0) {
      return ResponseHelper.success(
        res,
        'User already synced',
        existing[0]
      );
    }

    // Check duplicate roll/email
    const [duplicate] = await pool.query<StudentRow[]>(
      'SELECT student_id FROM Student WHERE roll_no = ? OR email = ?',
      [roll_no, email]
    );

    if (duplicate.length > 0) {
      return ResponseHelper.badRequest(
        res,
        'Roll number or email already exists'
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Student
       (clerk_id, name, roll_no, department, academic_year, gender, phone, email, cgpa, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clerkId,
        name,
        roll_no,
        department,
        academic_year,
        gender,
        phone || null,
        email,
        0,
        false
      ]
    );

    const [students] = await pool.query<StudentRow[]>(
      'SELECT * FROM Student WHERE student_id = ?',
      [result.insertId]
    );

    logSuccess('POST', '/api/auth/sync', `User synced: ${result.insertId}`);

    return ResponseHelper.created(
      res,
      'User synced successfully',
      students[0]
    );

  } catch (error) {
    logError('POST', '/api/auth/sync', error as Error);
    return ResponseHelper.error(
      res,
      'Failed to sync user',
      500,
      (error as Error).message
    );
  }
};

/**
 * Get Logged-in User Profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  logRequest('GET', '/api/auth/profile');

  try {
    const clerkId = req.user?.clerkId;

    if (!clerkId) {
      return ResponseHelper.badRequest(res, 'User not authenticated');
    }

    const [students] = await pool.query<StudentRow[]>(
      `SELECT student_id,
              clerk_id,
              name,
              roll_no,
              department,
              academic_year,
              gender,
              phone,
              email,
              cgpa,
              is_admin,
              created_at
       FROM Student
       WHERE clerk_id = ?`,
      [clerkId]
    );

    if (!students.length) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('GET', '/api/auth/profile', `Profile fetched: ${clerkId}`);

    return ResponseHelper.success(
      res,
      'Profile retrieved successfully',
      students[0]
    );

  } catch (error) {
    logError('GET', '/api/auth/profile', error as Error);
    return ResponseHelper.error(
      res,
      'Failed to fetch profile',
      500,
      (error as Error).message
    );
  }
};
