import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

export const getAllAllotments = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('GET', '/api/allotments');
  try {
    const { student_id, status } = req.query;

    let query = `
      SELECT a.*, s.name as student_name, s.roll_no, s.department,
        r.room_number, r.room_type, h.hostel_name
      FROM Allotment a
      JOIN Student s ON a.student_id = s.student_id
      JOIN Room r ON a.room_id = r.room_id
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.allotment_date DESC';

    const [allotments] = await pool.query<RowDataPacket[]>(query, params);
    logSuccess('GET', '/api/allotments', `Retrieved ${allotments.length} allotments`);
    return ResponseHelper.success(res, 'Allotments retrieved successfully', allotments);
  } catch (error) {
    logError('GET', '/api/allotments', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch allotments', 500, (error as Error).message);
  }
};

export const getAllotmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('GET', `/api/allotments/${id}`);
  try {
    const [allotments] = await pool.query<RowDataPacket[]>(
      `SELECT a.*, s.name as student_name, s.roll_no, s.department,
        r.room_number, r.room_type, h.hostel_name
       FROM Allotment a
       JOIN Student s ON a.student_id = s.student_id
       JOIN Room r ON a.room_id = r.room_id
       JOIN Hostel h ON r.hostel_id = h.hostel_id
       WHERE a.allotment_id = ?`,
      [id]
    );

    if (allotments.length === 0) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('GET', `/api/allotments/${id}`, 'Allotment retrieved');
    return ResponseHelper.success(res, 'Allotment retrieved successfully', allotments[0]);
  } catch (error) {
    logError('GET', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch allotment', 500, (error as Error).message);
  }
};

export const createAllotment = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('POST', '/api/allotments');
  try {
    const { student_id, room_id } = req.body;

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Allotment WHERE student_id = ? AND status = ?',
      [student_id, 'Active']
    );

    if (existing.length > 0) {
      return ResponseHelper.badRequest(res, 'Student already has an active allotment');
    }

    const [roomInfo] = await pool.query<RowDataPacket[]>(
      `SELECT r.capacity, COUNT(a.allotment_id) as current_count
       FROM Room r
       LEFT JOIN Allotment a ON r.room_id = a.room_id AND a.status = 'Active'
       WHERE r.room_id = ?
       GROUP BY r.room_id`,
      [room_id]
    );

    if (roomInfo.length === 0) {
      return ResponseHelper.notFound(res, 'Room');
    }

    if (roomInfo[0].current_count >= roomInfo[0].capacity) {
      return ResponseHelper.badRequest(res, 'Room is at full capacity');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Allotment (student_id, room_id, allotment_date, status) VALUES (?, ?, NOW(), ?)',
      [student_id, room_id, 'Active']
    );

    const data = { allotment_id: result.insertId, student_id, room_id, status: 'Active' };
    logSuccess('POST', '/api/allotments', `Allotment created: ${result.insertId} (DB write success)`);
    return ResponseHelper.created(res, 'Allotment created successfully', data);
  } catch (error) {
    logError('POST', '/api/allotments', error as Error);
    return ResponseHelper.error(res, 'Failed to create allotment', 500, (error as Error).message);
  }
};

export const updateAllotment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('PUT', `/api/allotments/${id}`);
  try {
    const { status, reason } = req.body;

    let query = 'UPDATE Allotment SET status = ?';
    const params: any[] = [status];

    if (status === 'Vacated') {
      query += ', vacated_date = NOW()';
      if (reason) {
        query += ', reason = ?';
        params.push(reason);
      }
    }

    query += ' WHERE allotment_id = ?';
    params.push(id);

    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('PUT', `/api/allotments/${id}`, 'Allotment updated (DB write success)');
    return ResponseHelper.success(res, 'Allotment updated successfully');
  } catch (error) {
    logError('PUT', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update allotment', 500, (error as Error).message);
  }
};

export const deleteAllotment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/allotments/${id}`);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Allotment WHERE allotment_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('DELETE', `/api/allotments/${id}`, 'Allotment deleted (DB write success)');
    return ResponseHelper.success(res, 'Allotment deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete allotment', 500, (error as Error).message);
  }
};
