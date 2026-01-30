import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

export const getAllHostels = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('GET', '/api/hostels');
  
  try {
    const [hostels] = await pool.query<RowDataPacket[]>(
      `SELECT h.*, 
        COUNT(DISTINCT r.room_id) as total_rooms,
        COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.allotment_id END) as occupied_rooms
       FROM Hostel h
       LEFT JOIN Room r ON h.hostel_id = r.hostel_id
       LEFT JOIN Allotment a ON r.room_id = a.room_id AND a.status = 'Active'
       GROUP BY h.hostel_id`
    );

    logSuccess('GET', '/api/hostels', `Retrieved ${hostels.length} hostels`);
    ResponseHelper.success(res, 'Hostels retrieved successfully', hostels);
  } catch (error) {
    logError('GET', '/api/hostels', error as Error);
    ResponseHelper.error(res, 'Failed to fetch hostels', 500, (error as Error).message);
  }
};

export const getHostelById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('GET', `/api/hostels/${id}`);
  try {
    const [hostels] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Hostel WHERE hostel_id = ?',
      [id]
    );

    if (hostels.length === 0) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('GET', `/api/hostels/${id}`, 'Hostel retrieved');
    return ResponseHelper.success(res, 'Hostel retrieved successfully', hostels[0]);
  } catch (error) {
    logError('GET', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch hostel', 500, (error as Error).message);
  }
};

export const createHostel = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('POST', '/api/hostels');
  try {
    const { hostel_name, type, capacity } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Hostel (hostel_name, type, capacity) VALUES (?, ?, ?)',
      [hostel_name, type, capacity]
    );

    const data = { hostel_id: result.insertId, hostel_name, type, capacity };
    logSuccess('POST', '/api/hostels', `Hostel created: ${result.insertId} (DB write success)`);
    return ResponseHelper.created(res, 'Hostel created successfully', data);
  } catch (error) {
    logError('POST', '/api/hostels', error as Error);
    return ResponseHelper.error(res, 'Failed to create hostel', 500, (error as Error).message);
  }
};

export const updateHostel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('PUT', `/api/hostels/${id}`);
  try {
    const { hostel_name, type, capacity } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Hostel SET hostel_name = ?, type = ?, capacity = ? WHERE hostel_id = ?',
      [hostel_name, type, capacity, id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('PUT', `/api/hostels/${id}`, 'Hostel updated (DB write success)');
    return ResponseHelper.success(res, 'Hostel updated successfully');
  } catch (error) {
    logError('PUT', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update hostel', 500, (error as Error).message);
  }
};

export const deleteHostel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/hostels/${id}`);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Hostel WHERE hostel_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('DELETE', `/api/hostels/${id}`, 'Hostel deleted (DB write success)');
    return ResponseHelper.success(res, 'Hostel deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete hostel', 500, (error as Error).message);
  }
};
