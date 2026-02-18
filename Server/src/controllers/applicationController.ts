import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper } from '../utils/response.js';

/**
 * GET applications
 */
export const getApplications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, s.name AS student_name,
              h.hostel_name
       FROM Application a
       JOIN Student s ON a.student_id = s.student_id
       JOIN Hostel h ON a.preferred_hostel_id = h.hostel_id
       ORDER BY a.applied_date DESC`
    );

    return ResponseHelper.success(res, 'Applications retrieved successfully', rows);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch applications', 500, (error as Error).message);
  }
};

/**
 * POST application
 */
export const createApplication = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { student_id, preferred_hostel_id, preferred_room_type } = req.body;

    const validRoomTypes = ['Single', 'Double', 'Triple'];
    if (!validRoomTypes.includes(preferred_room_type)) {
      return ResponseHelper.badRequest(res, 'Invalid room type');
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT application_id
       FROM Application
       WHERE student_id = ?
       AND status IN ('Pending', 'Approved')`,
      [student_id]
    );

    if (existing.length > 0) {
      return ResponseHelper.badRequest(res, 'Student already has active application');
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Application
       (student_id, preferred_hostel_id, preferred_room_type, applied_date, status)
       VALUES (?, ?, ?, NOW(), 'Pending')`,
      [student_id, preferred_hostel_id, preferred_room_type]
    );

    return ResponseHelper.created(res, 'Application submitted successfully', {
      application_id: result.insertId
    });

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to create application', 500, (error as Error).message);
  }
};
