import { Request, Response } from 'express';
import pool from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ResponseHelper } from '../utils/response.js';

/**
 * GET complaints
 */
export const getComplaints = async (req: Request, res: Response): Promise<Response> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, s.name AS student_name,
              r.room_number, h.hostel_name
       FROM Complaint c
       JOIN Student s ON c.student_id = s.student_id
       JOIN Room r ON c.room_id = r.room_id
       JOIN Hostel h ON r.hostel_id = h.hostel_id
       ORDER BY c.raised_date DESC`
    );

    return ResponseHelper.success(res, 'Complaints retrieved successfully', rows);
  } catch (error) {
    return ResponseHelper.error(res, 'Failed to fetch complaints', 500, (error as Error).message);
  }
};

/**
 * POST complaint
 */
export const createComplaint = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { student_id, room_id, category, description } = req.body;

    const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];

    if (!validCategories.includes(category)) {
      return ResponseHelper.badRequest(res, 'Invalid category');
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Complaint (student_id, room_id, category, description, raised_date, status)
       VALUES (?, ?, ?, ?, NOW(), 'Open')`,
      [student_id, room_id, category, description]
    );

    return ResponseHelper.created(res, 'Complaint created successfully', {
      complaint_id: result.insertId
    });

  } catch (error) {
    return ResponseHelper.error(res, 'Failed to create complaint', 500, (error as Error).message);
  }
};
