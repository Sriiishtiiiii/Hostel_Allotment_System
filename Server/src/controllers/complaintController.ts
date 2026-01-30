import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

// Get all complaints
export const getComplaints = async (req: Request, res: Response) => {
  logRequest('GET', '/api/complaints');
  try {
    const { student_id, status } = req.query;
    
    let query = `
      SELECT 
        c.*,
        s.name as student_name,
        s.roll_no,
        r.room_number,
        h.hostel_name
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      JOIN Room r ON c.room_id = r.room_id
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (student_id) {
      query += ' AND c.student_id = ?';
      params.push(student_id);
    }
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY c.raised_date DESC';
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    logSuccess('GET', '/api/complaints', `Retrieved ${rows.length} complaints`);
    return ResponseHelper.success(res, 'Complaints retrieved successfully', rows);
  } catch (error) {
    logError('GET', '/api/complaints', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch complaints', 500, (error as Error).message);
  }
};

// Get single complaint
export const getComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('GET', `/api/complaints/${id}`);
  try {
    const query = `
      SELECT 
        c.*,
        s.name as student_name,
        s.roll_no,
        r.room_number,
        h.hostel_name
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      JOIN Room r ON c.room_id = r.room_id
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      WHERE c.complaint_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return ResponseHelper.notFound(res, 'Complaint');
    }
    
    logSuccess('GET', `/api/complaints/${id}`, 'Complaint retrieved');
    return ResponseHelper.success(res, 'Complaint retrieved successfully', rows[0]);
  } catch (error) {
    logError('GET', `/api/complaints/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch complaint', 500, (error as Error).message);
  }
};

// Create new complaint
export const createComplaint = async (req: Request, res: Response) => {
  logRequest('POST', '/api/complaints');
  try {
    const { complaint_id, student_id, room_id, category, description } = req.body;
    
    if (!complaint_id || !student_id || !room_id || !category || !description) {
      return ResponseHelper.badRequest(res, 'All fields are required');
    }
    
    const query = `
      INSERT INTO Complaint (complaint_id, student_id, room_id, category, description, raised_date, status)
      VALUES (?, ?, ?, ?, ?, NOW(), 'Open')
    `;
    
    await pool.execute<ResultSetHeader>(query, [complaint_id, student_id, room_id, category, description]);
    
    // Fetch the created complaint with details
    const [complaint] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        c.*,
        s.name as student_name,
        s.roll_no,
        r.room_number,
        h.hostel_name
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      JOIN Room r ON c.room_id = r.room_id
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      WHERE c.complaint_id = ?
      `,
      [complaint_id]
    );
    
    const created = complaint[0];
    const io = req.app.get('io');
    if (io && created) {
      io.to('admin').emit('new_complaint', { type: 'complaint_created', data: created });
      io.to(`student_${student_id}`).emit('complaint_update', { type: 'complaint_created', data: created });
    }
    
    logSuccess('POST', '/api/complaints', `Complaint created: ${complaint_id} (DB write success)`);
    return ResponseHelper.created(res, 'Complaint created successfully', created);
  } catch (error) {
    logError('POST', '/api/complaints', error as Error);
    return ResponseHelper.error(res, 'Failed to create complaint', 500, (error as Error).message);
  }
};

// Update complaint
export const updateComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('PUT', `/api/complaints/${id}`);
  try {
    const { status } = req.body;
    
    if (!status) {
      return ResponseHelper.badRequest(res, 'Status is required');
    }
    
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return ResponseHelper.badRequest(res, 'Invalid status');
    }
    
    const query = `UPDATE Complaint SET status = ? WHERE complaint_id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, [status, id]);
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Complaint');
    }
    
    const [complaint] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        c.*,
        s.name as student_name,
        s.roll_no,
        r.room_number,
        h.hostel_name
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      JOIN Room r ON c.room_id = r.room_id
      JOIN Hostel h ON r.hostel_id = h.hostel_id
      WHERE c.complaint_id = ?
      `,
      [id]
    );
    
    const complaintData = complaint[0];
    const io = req.app.get('io');
    if (io && complaintData) {
      io.to('admin').emit('complaint_update', { type: 'complaint_updated', data: complaintData });
      io.to(`student_${complaintData.student_id}`).emit('complaint_update', { type: 'complaint_status_changed', data: complaintData });
    }
    
    logSuccess('PUT', `/api/complaints/${id}`, `Complaint updated (DB write success)`);
    return ResponseHelper.success(res, 'Complaint updated successfully', complaintData);
  } catch (error) {
    logError('PUT', `/api/complaints/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update complaint', 500, (error as Error).message);
  }
};

// Delete complaint
export const deleteComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('DELETE', `/api/complaints/${id}`);
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM Complaint WHERE complaint_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Complaint');
    }
    
    logSuccess('DELETE', `/api/complaints/${id}`, 'Complaint deleted (DB write success)');
    return ResponseHelper.success(res, 'Complaint deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/complaints/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete complaint', 500, (error as Error).message);
  }
};
