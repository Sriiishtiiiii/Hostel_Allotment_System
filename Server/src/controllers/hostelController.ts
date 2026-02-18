import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

/**
 * GET /api/hostels
 */
export const getAllHostels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logRequest('GET', '/api/hostels');

  try {
    const [hostels] = await pool.query<RowDataPacket[]>(
      `SELECT h.*,
              COUNT(DISTINCT r.room_id) AS total_rooms,
              COUNT(DISTINCT CASE WHEN a.status = 'Active' THEN a.allotment_id END) AS occupied_rooms
       FROM Hostel h
       LEFT JOIN Room r ON h.hostel_id = r.hostel_id
       LEFT JOIN Allotment a ON r.room_id = a.room_id AND a.status = 'Active'
       GROUP BY h.hostel_id`
    );

    logSuccess('GET', '/api/hostels', `Retrieved ${hostels.length} hostels`);
    return ResponseHelper.success(res, 'Hostels retrieved successfully', hostels);
  } catch (error) {
    logError('GET', '/api/hostels', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch hostels', 500, (error as Error).message);
  }
};

/**
 * GET /api/hostels/:id
 */
export const getHostelById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('GET', `/api/hostels/${id}`);

  try {
    const [hostels] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Hostel WHERE hostel_id = ?',
      [id]
    );

    if (!hostels.length) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('GET', `/api/hostels/${id}`, 'Hostel retrieved');
    return ResponseHelper.success(res, 'Hostel retrieved successfully', hostels[0]);
  } catch (error) {
    logError('GET', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch hostel', 500, (error as Error).message);
  }
};

/**
 * POST /api/hostels
 */
export const createHostel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logRequest('POST', '/api/hostels');

  try {
    const { hostel_name, type, capacity } = req.body;

    if (!hostel_name || !type || !capacity) {
      return ResponseHelper.badRequest(res, 'All fields are required');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Hostel (hostel_name, type, capacity) VALUES (?, ?, ?)',
      [hostel_name, type, capacity]
    );

    const data = {
      hostel_id: result.insertId,
      hostel_name,
      type,
      capacity
    };

    logSuccess('POST', '/api/hostels', `Hostel created: ${result.insertId}`);
    return ResponseHelper.created(res, 'Hostel created successfully', data);
  } catch (error) {
    logError('POST', '/api/hostels', error as Error);
    return ResponseHelper.error(res, 'Failed to create hostel', 500, (error as Error).message);
  }
};

/**
 * PUT /api/hostels/:id
 */
export const updateHostel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('PUT', `/api/hostels/${id}`);

  try {
    const { hostel_name, type, capacity } = req.body;

    if (!hostel_name || !type || !capacity) {
      return ResponseHelper.badRequest(res, 'All fields are required');
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Hostel SET hostel_name = ?, type = ?, capacity = ? WHERE hostel_id = ?',
      [hostel_name, type, capacity, id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('PUT', `/api/hostels/${id}`, 'Hostel updated');
    return ResponseHelper.success(res, 'Hostel updated successfully');
  } catch (error) {
    logError('PUT', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update hostel', 500, (error as Error).message);
  }
};

/**
 * DELETE /api/hostels/:id
 */
export const deleteHostel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/hostels/${id}`);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Hostel WHERE hostel_id = ?',
      [id]
    );

    if (!result.affectedRows) {
      return ResponseHelper.notFound(res, 'Hostel');
    }

    logSuccess('DELETE', `/api/hostels/${id}`, 'Hostel deleted');
    return ResponseHelper.success(res, 'Hostel deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/hostels/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete hostel', 500, (error as Error).message);
  }
};
