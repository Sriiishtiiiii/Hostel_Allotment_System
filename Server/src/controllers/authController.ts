import { Request, Response } from "express";
import pool from "../config/database.js";
import { comparePassword, generateToken } from "../utils/auth.js";
import { AuthUser } from "../models/types.js";
import { ResponseHelper, logRequest, logSuccess, logError } from "../utils/response.js";

/* ======================================
   LOGIN CONTROLLER
====================================== */

export const login = async (req: Request, res: Response) => {
  logRequest('POST', '/api/auth/login');
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return ResponseHelper.badRequest(res, "Email, password, and role are required");
    }

    let user: AuthUser | null = null;
    let hashedPassword: string | null = null;

    /* -------- STUDENT LOGIN -------- */
    if (role === "student") {
      const [rows]: any = await pool.query(
        "SELECT student_id AS id, name, email, password FROM Student WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return ResponseHelper.error(res, "Invalid credentials", 401);
      }

      user = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: "student",
      };

      hashedPassword = rows[0].password;
    }

    /* -------- ADMIN LOGIN -------- */
    if (role === "admin") {
      const [rows]: any = await pool.query(
        "SELECT admin_id AS id, name, email, password FROM Admin WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return ResponseHelper.error(res, "Invalid credentials", 401);
      }

      user = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: "admin",
      };

      hashedPassword = rows[0].password;
    }

    if (!user || !hashedPassword) {
      return ResponseHelper.error(res, "Invalid credentials", 401);
    }

    const isMatch = await comparePassword(password, hashedPassword);

    if (!isMatch) {
      return ResponseHelper.error(res, "Invalid credentials", 401);
    }

    const token = generateToken(user);
    logSuccess('POST', '/api/auth/login', `User ${user.id} logged in`);
    return ResponseHelper.success(res, "Login successful", { token, user });
  } catch (error) {
    logError('POST', '/api/auth/login', error as Error);
    return ResponseHelper.error(res, "Server error", 500, (error as Error).message);
  }
};

/* ======================================
   GET PROFILE CONTROLLER
====================================== */

export const getProfile = async (req: Request, res: Response) => {
  logRequest('GET', '/api/auth/profile');
  try {
    const user = req.user as AuthUser;

    if (!user) {
      return ResponseHelper.error(res, "Unauthorized", 401);
    }

    return ResponseHelper.success(res, "Profile retrieved", { user });
  } catch (error) {
    logError('GET', '/api/auth/profile', error as Error);
    return ResponseHelper.error(res, "Server error", 500, (error as Error).message);
  }
};
