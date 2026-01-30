import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { clerkClient } from '@clerk/clerk-sdk-node';

export interface ClerkUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'student' | 'admin';
}

export interface ClerkAuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
  user?: ClerkUser;
}

export const clerkAuth = async (
  req: ClerkAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.substring(7).trim();

    // Verify token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!payload || !payload.sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(payload.sub);

    if (!clerkUser) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach auth and user info to request
    req.auth = {
      userId: clerkUser.id,
      sessionId: payload.sid || '',
    };

    req.user = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      // Role will be determined from metadata or database
      role: (clerkUser.publicMetadata?.role as 'student' | 'admin') || 'student',
    };

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (...roles: ('student' | 'admin')[]) => {
  return (req: ClerkAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Insufficient permissions. Required: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
