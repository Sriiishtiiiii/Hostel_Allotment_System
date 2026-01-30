import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

// Get all payments
export const getPayments = async (req: Request, res: Response) => {
  logRequest('GET', '/api/payments');
  try {
    const { student_id, status } = req.query;
    
    let query = `
      SELECT 
        p.*,
        s.name as student_name,
        s.roll_no,
        f.amount as fee_amount,
        h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY p.payment_date DESC';
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    logSuccess('GET', '/api/payments', `Retrieved ${rows.length} payments`);
    return ResponseHelper.success(res, 'Payments retrieved successfully', rows);
  } catch (error) {
    logError('GET', '/api/payments', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch payments', 500, (error as Error).message);
  }
};

// Get single payment
export const getPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('GET', `/api/payments/${id}`);
  try {
    const query = `
      SELECT 
        p.*,
        s.name as student_name,
        s.roll_no,
        f.amount as fee_amount,
        h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE p.payment_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return ResponseHelper.notFound(res, 'Payment');
    }
    
    logSuccess('GET', `/api/payments/${id}`, 'Payment retrieved');
    return ResponseHelper.success(res, 'Payment retrieved successfully', rows[0]);
  } catch (error) {
    logError('GET', `/api/payments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch payment', 500, (error as Error).message);
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  logRequest('POST', '/api/payments');
  try {
    const { payment_id, student_id, fee_id, mode } = req.body;
    
    if (!payment_id || !student_id || !fee_id || !mode) {
      return ResponseHelper.badRequest(res, 'All fields are required');
    }
    
    const query = `
      INSERT INTO Payment (payment_id, student_id, fee_id, payment_date, mode, status)
      VALUES (?, ?, ?, NOW(), ?, 'Pending')
    `;
    
    await pool.execute<ResultSetHeader>(query, [payment_id, student_id, fee_id, mode]);
    
    const [payment] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        p.*,
        s.name as student_name,
        s.roll_no,
        f.amount as fee_amount,
        h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE p.payment_id = ?
      `,
      [payment_id]
    );
    
    const created = payment[0];
    const io = req.app.get('io');
    if (io && created) {
      io.to('admin').emit('new_payment', { type: 'payment_created', data: created });
      io.to(`student_${student_id}`).emit('payment_update', { type: 'payment_due', data: created });
    }
    
    logSuccess('POST', '/api/payments', `Payment created: ${payment_id} (DB write success)`);
    return ResponseHelper.created(res, 'Payment record created successfully', created);
  } catch (error) {
    logError('POST', '/api/payments', error as Error);
    return ResponseHelper.error(res, 'Failed to create payment record', 500, (error as Error).message);
  }
};

// Update payment
export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('PUT', `/api/payments/${id}`);
  try {
    const { status, mode } = req.body;
    
    if (!status) {
      return ResponseHelper.badRequest(res, 'Status is required');
    }
    
    const validStatuses = ['Pending', 'Paid', 'Failed'];
    if (!validStatuses.includes(status)) {
      return ResponseHelper.badRequest(res, 'Invalid status');
    }
    
    let query = 'UPDATE Payment SET status = ?';
    const params: any[] = [status];
    
    if (mode) {
      query += ', mode = ?';
      params.push(mode);
    }
    
    query += ' WHERE payment_id = ?';
    params.push(id);
    
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Payment');
    }
    
    const [payment] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        p.*,
        s.name as student_name,
        s.roll_no,
        f.amount as fee_amount,
        h.hostel_name
      FROM Payment p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Fee f ON p.fee_id = f.fee_id
      JOIN Hostel h ON f.hostel_id = h.hostel_id
      WHERE p.payment_id = ?
      `,
      [id]
    );
    
    const paymentData = payment[0];
    const io = req.app.get('io');
    if (io && paymentData) {
      io.to('admin').emit('payment_update', { type: 'payment_updated', data: paymentData });
      io.to(`student_${paymentData.student_id}`).emit('payment_update', { type: 'payment_status_changed', data: paymentData });
    }
    
    logSuccess('PUT', `/api/payments/${id}`, 'Payment updated (DB write success)');
    return ResponseHelper.success(res, 'Payment updated successfully', paymentData);
  } catch (error) {
    logError('PUT', `/api/payments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update payment', 500, (error as Error).message);
  }
};

// Delete payment
export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('DELETE', `/api/payments/${id}`);
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM Payment WHERE payment_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Payment');
    }
    
    logSuccess('DELETE', `/api/payments/${id}`, 'Payment deleted (DB write success)');
    return ResponseHelper.success(res, 'Payment deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/payments/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete payment', 500, (error as Error).message);
  }
};
