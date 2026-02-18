import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

/**
 * GET /api/allotments
 */
export const getAllAllotments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logRequest('GET', '/api/allotments');

  try {
    const { student_id, status } = req.query;

    let query = `
      SELECT a.*, s.name AS student_name, s.roll_no, s.department,
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

/**
 * GET /api/allotments/:id
 */
export const getAllotmentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('GET', `/api/allotments/${id}`);

  try {
    const [allotments] = await pool.query<RowDataPacket[]>(
      `SELECT a.*, s.name AS student_name, s.roll_no, s.department,
              r.room_number, r.room_type, h.hostel_name
       FROM Allotment a
       JOIN Student s ON a.student_id = s.student_id
       JOIN Room r ON a.room_id = r.room_id
       JOIN Hostel h ON r.hostel_id = h.hostel_id
       WHERE a.allotment_id = ?`,
      [id]
    );

    if (!allotments.length) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('GET', `/api/allotments/${id}`, 'Allotment retrieved');
    return ResponseHelper.success(res, 'Allotment retrieved successfully', allotments[0]);
  } catch (error) {
    logError('GET', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch allotment', 500, (error as Error).message);
  }
};

/**
 * POST /api/allotments
 * Transaction-safe
 */
export const createAllotment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logRequest('POST', '/api/allotments');

  const connection = await pool.getConnection();

  try {
    const { student_id, room_id } = req.body;

    if (!student_id || !room_id) {
      return ResponseHelper.badRequest(res, 'Student ID and Room ID are required');
    }

    await connection.beginTransaction();

    // 1. Check existing active allotment
    const [existing] = await connection.query<RowDataPacket[]>(
      'SELECT 1 FROM Allotment WHERE student_id = ? AND status = "Active" FOR UPDATE',
      [student_id]
    );

    if (existing.length) {
      await connection.rollback();
      return ResponseHelper.badRequest(res, 'Student already has an active allotment');
    }

    // 2. Check room capacity safely
    const [roomInfo] = await connection.query<RowDataPacket[]>(
      `SELECT r.capacity,
              COUNT(a.allotment_id) AS current_count
       FROM Room r
       LEFT JOIN Allotment a
              ON r.room_id = a.room_id
              AND a.status = 'Active'
       WHERE r.room_id = ?
       GROUP BY r.room_id
       FOR UPDATE`,
      [room_id]
    );

    if (!roomInfo.length) {
      await connection.rollback();
      return ResponseHelper.notFound(res, 'Room');
    }

    if (roomInfo[0].current_count >= roomInfo[0].capacity) {
      await connection.rollback();
      return ResponseHelper.badRequest(res, 'Room is at full capacity');
    }

    // 3. Insert allotment
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO Allotment (student_id, room_id, allotment_date, status)
       VALUES (?, ?, NOW(), 'Active')`,
      [student_id, room_id]
    );

    await connection.commit();

    logSuccess('POST', '/api/allotments', `Allotment created: ${result.insertId}`);

    return ResponseHelper.created(res, 'Allotment created successfully', {
      allotment_id: result.insertId,
      student_id,
      room_id,
      status: 'Active'
    });

  } catch (error) {
    await connection.rollback();
    logError('POST', '/api/allotments', error as Error);
    return ResponseHelper.error(res, 'Failed to create allotment', 500, (error as Error).message);
  } finally {
    connection.release();
  }
};

/**
 * PUT /api/allotments/:id
 */
export const updateAllotment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('PUT', `/api/allotments/${id}`);

  try {
    const { status, reason } = req.body;

    if (!status) {
      return ResponseHelper.badRequest(res, 'Status is required');
    }

    let query = 'UPDATE Allotment SET status = ?';
    const params: any[] = [status];

    if (status === 'Vacated') {
      query += ', vacated_date = NOW(), reason = ?';
      params.push(reason || null);
    }

    query += ' WHERE allotment_id = ?';
    params.push(id);

    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('PUT', `/api/allotments/${id}`, 'Allotment updated');
    return ResponseHelper.success(res, 'Allotment updated successfully');
  } catch (error) {
    logError('PUT', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update allotment', 500, (error as Error).message);
  }
};

/**
 * DELETE /api/allotments/:id
 */
export const deleteAllotment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/allotments/${id}`);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Allotment WHERE allotment_id = ?',
      [id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Allotment');
    }

    logSuccess('DELETE', `/api/allotments/${id}`, 'Allotment deleted');
    return ResponseHelper.success(res, 'Allotment deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/allotments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete allotment', 500, (error as Error).message);
  }
};
