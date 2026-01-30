import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

// Get all students
export const getStudents = async (req: Request, res: Response) => {
  logRequest('GET', '/api/students');
  try {
    const query = `SELECT * FROM Student ORDER BY name`;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    logSuccess('GET', '/api/students', `Retrieved ${rows.length} students`);
    return ResponseHelper.success(res, 'Students retrieved successfully', rows);
  } catch (error) {
    logError('GET', '/api/students', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch students', 500, (error as Error).message);
  }
};

// Get single student
export const getStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('GET', `/api/students/${id}`);
  try {
    const query = `SELECT * FROM Student WHERE student_id = ?`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('GET', `/api/students/${id}`, 'Student retrieved');
    return ResponseHelper.success(res, 'Student retrieved successfully', rows[0]);
  } catch (error) {
    logError('GET', `/api/students/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch student', 500, (error as Error).message);
  }
};

// Create new student
export const createStudent = async (req: Request, res: Response) => {
  logRequest('POST', '/api/students');
  try {
    const { student_id, name, roll_no, department, academic_year, gender, phone, email, cgpa } = req.body;

    if (!student_id || !name || !roll_no || !department || !academic_year || !gender || !phone || !email) {
      return ResponseHelper.badRequest(res, 'Required fields are missing');
    }

    const query = `
      INSERT INTO Student (student_id, name, roll_no, department, academic_year, gender, phone, email, cgpa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute<ResultSetHeader>(query, [
      student_id, name, roll_no, department, academic_year, gender, phone, email, cgpa || null
    ]);

    logSuccess('POST', '/api/students', `Student created: ${student_id} (DB write success)`);
    return ResponseHelper.created(res, 'Student created successfully', { student_id });
  } catch (error) {
    logError('POST', '/api/students', error as Error);
    return ResponseHelper.error(res, 'Failed to create student', 500, (error as Error).message);
  }
};

// Update student
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('PUT', `/api/students/${id}`);
  try {
    const { name, roll_no, department, academic_year, gender, phone, email, cgpa } = req.body;

    const query = `
      UPDATE Student 
      SET name = ?, roll_no = ?, department = ?, academic_year = ?, gender = ?, phone = ?, email = ?, cgpa = ?
      WHERE student_id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      name, roll_no, department, academic_year, gender, phone, email, cgpa || null, id
    ]);

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('PUT', `/api/students/${id}`, 'Student updated (DB write success)');
    return ResponseHelper.success(res, 'Student updated successfully');
  } catch (error) {
    logError('PUT', `/api/students/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update student', 500, (error as Error).message);
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('DELETE', `/api/students/${id}`);
  try {
    const query = `DELETE FROM Student WHERE student_id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Student');
    }

    logSuccess('DELETE', `/api/students/${id}`, 'Student deleted (DB write success)');
    return ResponseHelper.success(res, 'Student deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/students/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete student', 500, (error as Error).message);
  }
};
