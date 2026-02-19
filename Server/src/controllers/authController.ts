import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'nith.ac.in';
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface StudentRow extends RowDataPacket {
  student_id: number;
  name: string;
  roll_no: string;
  department: string;
  academic_year: number;
  gender: string;
  phone: string;
  email: string;
  cgpa: number;
  is_admin: boolean;
  password_hash: string;
  email_verified: boolean;
  verification_expires: Date;
  reset_token_expires: Date;
}

const generateToken = (student: StudentRow): string => {
  return jwt.sign(
    {
      student_id: student.student_id,
      email: student.email,
      name: student.name,
      is_admin: student.is_admin,
      roll_no: student.roll_no,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<Response> => {
  logRequest('POST', '/api/auth/signup');

  const { name, roll_no, email, password, department, academic_year, gender, phone } = req.body;

  if (!name || !roll_no || !email || !password || !department || !academic_year || !gender) {
    return ResponseHelper.badRequest(res, 'Missing required fields');
  }

  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain !== ALLOWED_DOMAIN) {
    return ResponseHelper.badRequest(res, `Only @${ALLOWED_DOMAIN} email addresses are allowed`);
  }

  if (password.length < 8) {
    return ResponseHelper.badRequest(res, 'Password must be at least 8 characters');
  }

  try {
    const [existing] = await pool.query<StudentRow[]>(
      'SELECT student_id, email, roll_no, password_hash FROM Student WHERE email = ? OR roll_no = ?',
      [email, roll_no]
    );

    const password_hash = await bcrypt.hash(password, 12);
    const verification_token = crypto.randomBytes(32).toString('hex');
    const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existing.length > 0) {
      const match = existing[0];

      // CSV-imported student (same email + roll_no, no password set yet) → allow password registration
      if (match.email === email.toLowerCase() && match.roll_no === roll_no && !match.password_hash) {
        await pool.query(
          `UPDATE Student
           SET name = ?, password_hash = ?, department = ?, academic_year = ?, gender = ?,
               phone = ?, email_verified = FALSE,
               verification_token = ?, verification_expires = ?
           WHERE student_id = ?`,
          [name, password_hash, department, academic_year, gender,
           phone || null, verification_token, verification_expires, match.student_id]
        );

        sendVerificationEmail(email, name, verification_token).catch((err) =>
          console.error('Failed to send verification email:', err)
        );

        return ResponseHelper.created(res, 'Account created. Please check your email to verify.', {
          student_id: match.student_id,
          email,
        });
      }

      return ResponseHelper.badRequest(res, 'Email or roll number already registered');
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Student
       (name, roll_no, email, password_hash, department, academic_year, gender, phone,
        email_verified, verification_token, verification_expires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?)`,
      [name, roll_no, email, password_hash, department, academic_year, gender,
       phone || null, verification_token, verification_expires]
    );

    sendVerificationEmail(email, name, verification_token).catch((err) =>
      console.error('Failed to send verification email:', err)
    );

    logSuccess('POST', '/api/auth/signup', `Student registered: ${result.insertId}`);
    return ResponseHelper.created(res, 'Account created. Please check your email to verify.', {
      student_id: result.insertId,
      email,
    });
  } catch (error) {
    logError('POST', '/api/auth/signup', error as Error);
    return ResponseHelper.error(res, 'Signup failed', 500, (error as Error).message);
  }
};

// GET /api/auth/verify-email?token=xxx
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.query as { token: string };

  if (!token) return ResponseHelper.badRequest(res, 'Verification token is required');

  try {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT student_id, email_verified, verification_expires FROM Student WHERE verification_token = ?',
      [token]
    );

    if (!rows.length) return ResponseHelper.badRequest(res, 'Invalid verification token');

    const student = rows[0];
    if (student.email_verified) {
      return ResponseHelper.success(res, 'Email already verified');
    }

    if (new Date() > new Date(student.verification_expires)) {
      return ResponseHelper.badRequest(res, 'Verification token expired. Please request a new one.');
    }

    await pool.query(
      'UPDATE Student SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE student_id = ?',
      [student.student_id]
    );

    logSuccess('GET', '/api/auth/verify-email', `Email verified: ${student.student_id}`);
    return ResponseHelper.success(res, 'Email verified successfully. You can now log in.');
  } catch (error) {
    logError('GET', '/api/auth/verify-email', error as Error);
    return ResponseHelper.error(res, 'Verification failed', 500);
  }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  if (!email) return ResponseHelper.badRequest(res, 'Email is required');

  try {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT student_id, name, email_verified FROM Student WHERE email = ?',
      [email]
    );

    if (!rows.length) return ResponseHelper.badRequest(res, 'No account found with this email');
    if (rows[0].email_verified) return ResponseHelper.badRequest(res, 'Email is already verified');

    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE Student SET verification_token = ?, verification_expires = ? WHERE student_id = ?',
      [newToken, newExpires, rows[0].student_id]
    );

    sendVerificationEmail(email, rows[0].name, newToken).catch(console.error);
    return ResponseHelper.success(res, 'Verification email resent');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to resend verification', 500);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<Response> => {
  logRequest('POST', '/api/auth/login');

  const { email, password } = req.body;
  if (!email || !password) return ResponseHelper.badRequest(res, 'Email and password are required');

  try {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT * FROM Student WHERE email = ?',
      [email]
    );

    if (!rows.length) return ResponseHelper.error(res, 'Invalid email or password', 401);

    const student = rows[0];

    if (!student.email_verified) {
      return ResponseHelper.error(res, 'Please verify your email before logging in', 403);
    }

    if (!student.password_hash) {
      return ResponseHelper.error(res, 'Account not set up. Please contact admin.', 403);
    }

    const isValid = await bcrypt.compare(password, student.password_hash);
    if (!isValid) return ResponseHelper.error(res, 'Invalid email or password', 401);

    const token = generateToken(student);

    logSuccess('POST', '/api/auth/login', `Login: ${student.email}`);
    return ResponseHelper.success(res, 'Login successful', {
      token,
      user: {
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        roll_no: student.roll_no,
        department: student.department,
        cgpa: student.cgpa,
        is_admin: student.is_admin,
        gender: student.gender,
      },
    });
  } catch (error) {
    logError('POST', '/api/auth/login', error as Error);
    return ResponseHelper.error(res, 'Login failed', 500);
  }
};

// GET /api/auth/me  (requires requireAuth)
export const getMe = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const [rows] = await pool.query<StudentRow[]>(
      `SELECT student_id, name, roll_no, department, academic_year, gender,
              phone, email, cgpa, is_admin, created_at
       FROM Student WHERE student_id = ?`,
      [req.user!.student_id]
    );

    if (!rows.length) return ResponseHelper.notFound(res, 'Student');
    return ResponseHelper.success(res, 'Profile fetched', rows[0]);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch profile', 500);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;
  if (!email) return ResponseHelper.badRequest(res, 'Email is required');

  const SUCCESS_MSG = 'If that email is registered, a reset link has been sent';

  try {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT student_id, name FROM Student WHERE email = ?',
      [email]
    );

    if (!rows.length) return ResponseHelper.success(res, SUCCESS_MSG);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE Student SET reset_token = ?, reset_token_expires = ? WHERE student_id = ?',
      [token, expires, rows[0].student_id]
    );

    sendPasswordResetEmail(email, rows[0].name, token).catch(console.error);
    return ResponseHelper.success(res, SUCCESS_MSG);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to process request', 500);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token, password } = req.body;

  if (!token || !password) return ResponseHelper.badRequest(res, 'Token and password are required');
  if (password.length < 8) return ResponseHelper.badRequest(res, 'Password must be at least 8 characters');

  try {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT student_id, reset_token_expires FROM Student WHERE reset_token = ?',
      [token]
    );

    if (!rows.length) return ResponseHelper.badRequest(res, 'Invalid or expired reset token');
    if (new Date() > new Date(rows[0].reset_token_expires)) {
      return ResponseHelper.badRequest(res, 'Reset token has expired');
    }

    const password_hash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE Student SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE student_id = ?',
      [password_hash, rows[0].student_id]
    );

    return ResponseHelper.success(res, 'Password reset successfully. You can now log in.');
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to reset password', 500);
  }
};
