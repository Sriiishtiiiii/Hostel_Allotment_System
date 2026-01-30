import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { AuthUser } from '../models/types.js';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and has Bearer token
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header provided' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid authorization header format. Expected: Bearer <token>' });
      return;
    }

    // Extract token from Bearer scheme
    const token = authHeader.substring(7).trim();

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify and decode token
    const user = verifyToken(token);

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Insufficient permissions. Required roles: ${roles.join(', ')}, but got: ${req.user.role}` 
      });
      return;
    }

    next();
  };
};
