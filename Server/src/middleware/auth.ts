import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import pool from '../config/database.js';
import { RowDataPacket } from 'mysql2';

/**
 * Extend Express Request type
 */
export interface AuthRequest extends Request {
  user?: {
    clerkId: string;
  };
}

/**
 * Clerk Authentication Middleware
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    req.user = {
      clerkId: payload.sub,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clerkId = req.user?.clerkId;

    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT is_admin FROM Student WHERE clerk_id = ?',
      [clerkId]
    );

    if (!rows.length || !rows[0].is_admin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch {
    res.status(500).json({ message: 'Authorization failed' });
  }
};
