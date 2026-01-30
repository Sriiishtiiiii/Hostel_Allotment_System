import { Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

export const getAllFees = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('GET', '/api/fees');
  try {
    const { hostel_id, academic_year } = req.query;

    let query = `
      SELECT f.*, h.hostel_name, h.type as hostel_type
      FROM Fee f
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (hostel_id) {
      query += ' AND f.hostel_id = ?';
      params.push(hostel_id);
    }

    if (academic_year) {
      query += ' AND f.academic_year = ?';
      params.push(academic_year);
    }

    const [fees] = await pool.query<RowDataPacket[]>(query, params);
    logSuccess('GET', '/api/fees', `Retrieved ${fees.length} fees`);
    return ResponseHelper.success(res, 'Fees retrieved successfully', fees);
  } catch (error) {
    logError('GET', '/api/fees', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch fees', 500, (error as Error).message);
  }
};

export const getFeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('GET', `/api/fees/${id}`);
  try {
    const [fees] = await pool.query<RowDataPacket[]>(
      `SELECT f.*, h.hostel_name, h.type as hostel_type
       FROM Fee f
       JOIN Hostel h ON f.hostel_id = h.hostel_id
       WHERE f.fee_id = ?`,
      [id]
    );

    if (fees.length === 0) {
      return ResponseHelper.notFound(res, 'Fee');
    }

    logSuccess('GET', `/api/fees/${id}`, 'Fee retrieved');
    return ResponseHelper.success(res, 'Fee retrieved successfully', fees[0]);
  } catch (error) {
    logError('GET', `/api/fees/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch fee', 500, (error as Error).message);
  }
};

export const createFee = async (req: AuthRequest, res: Response): Promise<void> => {
  logRequest('POST', '/api/fees');
  try {
    const { hostel_id, academic_year, amount } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Fee (hostel_id, academic_year, amount) VALUES (?, ?, ?)',
      [hostel_id, academic_year, amount]
    );

    const data = { fee_id: result.insertId, hostel_id, academic_year, amount };
    logSuccess('POST', '/api/fees', `Fee created: ${result.insertId} (DB write success)`);
    return ResponseHelper.created(res, 'Fee created successfully', data);
  } catch (error) {
    logError('POST', '/api/fees', error as Error);
    return ResponseHelper.error(res, 'Failed to create fee', 500, (error as Error).message);
  }
};

export const updateFee = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('PUT', `/api/fees/${id}`);
  try {
    const { hostel_id, academic_year, amount } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Fee SET hostel_id = ?, academic_year = ?, amount = ? WHERE fee_id = ?',
      [hostel_id, academic_year, amount, id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Fee');
    }

    logSuccess('PUT', `/api/fees/${id}`, 'Fee updated (DB write success)');
    return ResponseHelper.success(res, 'Fee updated successfully');
  } catch (error) {
    logError('PUT', `/api/fees/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update fee', 500, (error as Error).message);
  }
};

export const deleteFee = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  logRequest('DELETE', `/api/fees/${id}`);
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Fee WHERE fee_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Fee');
    }

    logSuccess('DELETE', `/api/fees/${id}`, 'Fee deleted (DB write success)');
    return ResponseHelper.success(res, 'Fee deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/fees/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete fee', 500, (error as Error).message);
  }
};
