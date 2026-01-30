import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

// Get all applications
export const getApplications = async (req: Request, res: Response) => {
  logRequest('GET', '/api/applications', req.headers.authorization);
  
  try {
    const { student_id, status } = req.query;
    
    let query = `
      SELECT 
        a.*,
        s.name as student_name,
        s.roll_no,
        s.cgpa,
        h.hostel_name,
        h.type as hostel_type
      FROM Application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN Hostel h ON a.preferred_hostel_id = h.hostel_id
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
    
    query += ' ORDER BY a.applied_date DESC';
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    
    logSuccess('GET', '/api/applications', `Retrieved ${rows.length} applications`);
    return ResponseHelper.success(res, 'Applications retrieved successfully', rows);
  } catch (error) {
    logError('GET', '/api/applications', error as Error);
    return ResponseHelper.error(res, 'Failed to fetch applications', 500, (error as Error).message);
  }
};

// Get single application
export const getApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('GET', `/api/applications/${id}`);
  
  try {
    const query = `
      SELECT 
        a.*,
        s.name as student_name,
        s.roll_no,
        s.cgpa,
        h.hostel_name,
        h.type as hostel_type
      FROM Application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN Hostel h ON a.preferred_hostel_id = h.hostel_id
      WHERE a.application_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return ResponseHelper.notFound(res, 'Application');
    }
    
    logSuccess('GET', `/api/applications/${id}`, 'Application retrieved');
    return ResponseHelper.success(res, 'Application retrieved successfully', rows[0]);
  } catch (error) {
    logError('GET', `/api/applications/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to fetch application', 500, (error as Error).message);
  }
};

// Create new application
export const createApplication = async (req: Request, res: Response) => {
  logRequest('POST', '/api/applications');
  
  try {
    const { application_id, student_id, preferred_hostel_id, preferred_room_type } = req.body;
    
    // Validate required fields
    if (!application_id || !student_id || !preferred_hostel_id || !preferred_room_type) {
      return ResponseHelper.badRequest(res, 'All fields are required (application_id, student_id, preferred_hostel_id, preferred_room_type)');
    }
    
    // Check if student already has an active application
    const [existingApp] = await pool.execute<RowDataPacket[]>(
      'SELECT application_id FROM Application WHERE student_id = ? AND status IN ("Pending", "Approved")',
      [student_id]
    );
    
    if (existingApp.length > 0) {
      return ResponseHelper.badRequest(res, 'Student already has an active application');
    }
    
    // Verify student exists
    const [studentExists] = await pool.execute<RowDataPacket[]>(
      'SELECT student_id FROM Student WHERE student_id = ?',
      [student_id]
    );
    
    if (studentExists.length === 0) {
      return ResponseHelper.badRequest(res, 'Student not found');
    }
    
    // Verify hostel exists
    const [hostelExists] = await pool.execute<RowDataPacket[]>(
      'SELECT hostel_id FROM Hostel WHERE hostel_id = ?',
      [preferred_hostel_id]
    );
    
    if (hostelExists.length === 0) {
      return ResponseHelper.badRequest(res, 'Hostel not found');
    }
    
    const query = `
      INSERT INTO Application (application_id, student_id, preferred_hostel_id, preferred_room_type, applied_date, status)
      VALUES (?, ?, ?, ?, NOW(), 'Pending')
    `;
    
    await pool.execute<ResultSetHeader>(query, [application_id, student_id, preferred_hostel_id, preferred_room_type]);
    
    // Fetch the created application with details
    const [application] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        a.*,
        s.name as student_name,
        s.roll_no,
        s.cgpa,
        h.hostel_name
      FROM Application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN Hostel h ON a.preferred_hostel_id = h.hostel_id
      WHERE a.application_id = ?
      `,
      [application_id]
    );
    
    // Real-time notification
    const io = req.app.get('io');
    if (io && application[0]) {
      io.to('admin').emit('new_application', {
        type: 'application_submitted',
        data: application[0]
      });
      
      io.to(`student_${student_id}`).emit('application_update', {
        type: 'application_submitted',
        data: application[0]
      });
    }
    
    logSuccess('POST', '/api/applications', `Application created: ${application_id}`);
    return ResponseHelper.created(res, 'Application submitted successfully', application[0]);
  } catch (error) {
    logError('POST', '/api/applications', error as Error);
    return ResponseHelper.error(res, 'Failed to create application', 500, (error as Error).message);
  }
};

// Update application
export const updateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('PUT', `/api/applications/${id}`);
  
  try {
    const { status } = req.body;
    
    if (!status) {
      return ResponseHelper.badRequest(res, 'Status is required');
    }
    
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return ResponseHelper.badRequest(res, 'Invalid status. Must be one of: Pending, Approved, Rejected');
    }
    
    const query = `UPDATE Application SET status = ? WHERE application_id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, [status, id]);
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Application');
    }
    
    // Fetch updated application with details
    const [application] = await pool.execute<RowDataPacket[]>(
      `
      SELECT 
        a.*,
        s.name as student_name,
        s.roll_no,
        s.cgpa,
        h.hostel_name
      FROM Application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN Hostel h ON a.preferred_hostel_id = h.hostel_id
      WHERE a.application_id = ?
      `,
      [id]
    );
    
    // Real-time notification
    const io = req.app.get('io');
    if (io && application[0]) {
      const appData = application[0];
      
      io.to('admin').emit('application_update', {
        type: 'application_status_changed',
        data: appData
      });
      
      io.to(`student_${appData.student_id}`).emit('application_update', {
        type: 'application_status_changed',
        data: appData
      });
    }
    
    logSuccess('PUT', `/api/applications/${id}`, `Application status updated to ${status}`);
    return ResponseHelper.success(res, 'Application updated successfully', application[0]);
  } catch (error) {
    logError('PUT', `/api/applications/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to update application', 500, (error as Error).message);
  }
};

// Delete application
export const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  logRequest('DELETE', `/api/applications/${id}`);
  
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM Application WHERE application_id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return ResponseHelper.notFound(res, 'Application');
    }
    
    logSuccess('DELETE', `/api/applications/${id}`, 'Application deleted');
    return ResponseHelper.success(res, 'Application deleted successfully');
  } catch (error) {
    logError('DELETE', `/api/applications/${id}`, error as Error);
    return ResponseHelper.error(res, 'Failed to delete application', 500, (error as Error).message);
  }
};
