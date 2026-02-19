import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      student_id: number;
      email: string;
      name: string;
      is_admin: boolean;
      roll_no: string;
    };
  }
}
