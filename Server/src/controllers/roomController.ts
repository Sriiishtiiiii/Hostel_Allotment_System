import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

export const getAllRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('GET', '/api/rooms');
  try {
    const { hostel_id } = req.query;

    let query = `
      SELECT r.*, h.hostel_name, h.type as hostel_type,
        COUNT(CASE WHEN a.status = 'Active' THEN a.allotment_id END) as current_occupancy
      FROM Room r
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      LEFT JOIN Allotment a ON r.room_id = a.room_id AND a.status = 'Active'
    `;

    const params: any[] = [];

    if (hostel_id) {
      query += ' WHERE r.hostel_id = ?';
      params.push(hostel_id);
    }

    query += ' GROUP BY r.room_id';

    const [rooms] = await pool.query<RowDataPacket[]>(query, params);
    logSuccess('GET', '/api/rooms', `Retrieved ${rooms.length} rooms`);
    return ResponseHelper.success(res, 'Rooms retrieved successfully', rooms);
  } catch (error) {
    logError('GET', '/api/rooms', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch rooms', 500, (error as Error).message);
  }
};

export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('GET', `/api/rooms/${id}`);
  try {
    const [rooms] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, h.hostel_name, 
        GROUP_CONCAT(s.name) as occupants
       FROM Room r
       JOIN Hostel h ON r.hostel_id = h.hostel_id
       LEFT JOIN Allotment a ON r.room_id = a.room_id AND a.status = 'Active'
       LEFT JOIN Student s ON a.student_id = s.student_id
       WHERE r.room_id = ?
       GROUP BY r.room_id`,
      [id]
    );

    if (rooms.length === 0) {
      return ResponseHelper.notFound(res, 'Room');
    }

    logSuccess('GET', `/api/rooms/${id}`, 'Room retrieved');
    return ResponseHelper.success(res, 'Room retrieved successfully', rooms[0]);
  } catch (error) {
    logError('GET', `/api/rooms/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch room', 500, (error as Error).message);
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('POST', '/api/rooms');
  try {
    const { hostel_id, room_number, room_type, capacity } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Room (hostel_id, room_number, room_type, capacity) VALUES (?, ?, ?, ?)',
      [hostel_id, room_number, room_type, capacity]
    );

    const data = { room_id: result.insertId, hostel_id, room_number, room_type, capacity };
    logSuccess('POST', '/api/rooms', `Room created: ${result.insertId} (DB write success)`);
    return ResponseHelper.created(res, 'Room created successfully', data);
  } catch (error) {
    logError('POST', '/api/rooms', error as Error);
    return ResponseHelper.error(res, 'Failed to create room', 500, (error as Error).message);
  }
};

export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('PUT', `/api/rooms/${id}`);
  try {
    const { hostel_id, room_number, room_type, capacity } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Room SET hostel_id = ?, room_number = ?, room_type = ?, capacity = ? WHERE room_id = ?',
      [hostel_id, room_number, room_type, capacity, id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Room');
    }

    logSuccess('PUT', `/api/rooms/${id}`, 'Room updated (DB write success)');
    return ResponseHelper.success(res, 'Room updated successfully');
  } catch (error) {
    logError('PUT', `/api/rooms/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update room', 500, (error as Error).message);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/rooms/${id}`);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Room WHERE room_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Room');
    }

    logSuccess('DELETE', `/api/rooms/${id}`, 'Room deleted (DB write success)');
    return ResponseHelper.success(res, 'Room deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/rooms/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete room', 500, (error as Error).message);
  }
};
