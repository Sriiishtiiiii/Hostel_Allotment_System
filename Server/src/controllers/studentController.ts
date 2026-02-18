import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

/**
 * GET /api/students
 * Admin-only route (should be protected later)
 */
export const getStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logRequest('GET', '/api/students');

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT student_id, clerk_id, name, roll_no, department,
              academic_year, gender, phone, email, cgpa,
              is_admin, created_at
       FROM Student
       ORDER BY name`
    );

    logSuccess('GET', '/api/students', `Retrieved ${rows.length} students`);
    return ResponseHelper.success(res, 'Students retrieved successfully', rows);
  } catch (error) {
    logError('GET', '/api/students', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch students', 500, (error as Error).message);
  }
};

/**
 * GET /api/students/:id
 */
export const getStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('GET', `/api/students/${id}`);

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT student_id, clerk_id, name, roll_no, department,
              academic_year, gender, phone, email, cgpa,
              is_admin, created_at
       FROM Student
       WHERE student_id = ?`,
      [id]
    );

    if (!rows.length) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('GET', `/api/students/${id}`, 'Student retrieved');
    return ResponseHelper.success(res, 'Student retrieved successfully', rows[0]);
  } catch (error) {
    logError('GET', `/api/students/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch student', 500, (error as Error).message);
  }
};

/**
 * PUT /api/students/:id
 * Admin edit student
 */
export const updateStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('PUT', `/api/students/${id}`);

  try {
    const { name, roll_no, department, academic_year, gender, phone, email, cgpa } = req.body;

    if (!name || !roll_no || !department || !academic_year || !gender) {
      return ResponseHelper.badRequest(res, 'Required fields are missing');
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Student
       SET name = ?, roll_no = ?, department = ?, academic_year = ?,
           gender = ?, phone = ?, email = ?, cgpa = ?
       WHERE student_id = ?`,
      [name, roll_no, department, academic_year, gender, phone || null, email || null, cgpa || null, id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('PUT', `/api/students/${id}`, 'Student updated');
    return ResponseHelper.success(res, 'Student updated successfully');
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return ResponseHelper.badRequest(res, 'Roll number or email already exists');
    }

    logError('PUT', `/api/students/${id}`, error);
    return ResponseHelper.error(res, 'Failed to update student', 500, error.message);
  }
};

/**
 * DELETE /api/students/:id
 * Admin-only
 */
export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/students/${id}`);

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM Student WHERE student_id = ?',
      [id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('DELETE', `/api/students/${id}`, 'Student deleted');
    return ResponseHelper.success(res, 'Student deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/students/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete student', 500, (error as Error).message);
  }
};
