import { Response } from 'express';
import { parse } from 'csv-parse/sync';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ResponseHelper, logRequest, logSuccess, logError } from '../utils/response.js';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'nith.ac.in';

interface CsvRow {
  roll_no: string;
  name: string;
  email: string;
  department: string;
  gender: string;
  academic_year: string;
  cgpa: string;
}

interface ParsedStudent {
  roll_no: string;
  name: string;
  email: string;
  department: string;
  gender: string;
  academic_year: number;
  cgpa: number | null;
  status: 'new' | 'existing' | 'error';
  error?: string;
}

const VALID_GENDERS = ['male', 'female', 'other'];
const VALID_DEPARTMENTS = [
  'computer science', 'electronics', 'electrical', 'mechanical',
  'civil', 'chemical', 'architecture', 'physics', 'mathematics', 'other'
];

function validateRow(row: CsvRow, index: number): { student: ParsedStudent | null; error: string | null } {
  const roll_no = row.roll_no?.trim();
  const name = row.name?.trim();
  const email = row.email?.trim().toLowerCase();
  const department = row.department?.trim();
  const gender = row.gender?.trim();
  const academic_year = parseInt(row.academic_year?.trim());
  const cgpa = row.cgpa ? parseFloat(row.cgpa.trim()) : null;

  if (!roll_no) return { student: null, error: `Row ${index + 2}: roll_no is required` };
  if (!name) return { student: null, error: `Row ${index + 2}: name is required` };
  if (!email) return { student: null, error: `Row ${index + 2}: email is required` };
  if (!department) return { student: null, error: `Row ${index + 2}: department is required` };
  if (!gender) return { student: null, error: `Row ${index + 2}: gender is required` };

  const emailDomain = email.split('@')[1];
  if (emailDomain !== ALLOWED_DOMAIN) {
    return {
      student: {
        roll_no, name, email, department, gender,
        academic_year, cgpa, status: 'error',
        error: `Email must be @${ALLOWED_DOMAIN}`
      },
      error: null
    };
  }

  if (!VALID_GENDERS.includes(gender.toLowerCase())) {
    return {
      student: {
        roll_no, name, email, department, gender,
        academic_year, cgpa, status: 'error',
        error: `Invalid gender: ${gender}`
      },
      error: null
    };
  }

  if (isNaN(academic_year) || academic_year < 2000 || academic_year > 2030) {
    return {
      student: {
        roll_no, name, email, department, gender,
        academic_year, cgpa, status: 'error',
        error: `Invalid academic_year: ${row.academic_year}`
      },
      error: null
    };
  }

  if (cgpa !== null && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) {
    return {
      student: {
        roll_no, name, email, department, gender,
        academic_year, cgpa, status: 'error',
        error: `Invalid CGPA: ${row.cgpa} (must be 0–10)`
      },
      error: null
    };
  }

  const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

  return {
    student: {
      roll_no,
      name,
      email,
      department,
      gender: normalizedGender,
      academic_year,
      cgpa,
      status: 'new', // will be updated after DB check
    },
    error: null
  };
}

// POST /api/admin/csv/upload
// Parses CSV and returns preview — does NOT save to DB
export const uploadCsvPreview = async (req: AuthRequest, res: Response): Promise<Response> => {
  logRequest('POST', '/api/admin/csv/upload');

  if (!req.file) {
    return ResponseHelper.badRequest(res, 'No file uploaded');
  }

  try {
    const content = req.file.buffer.toString('utf-8');

    let rows: CsvRow[];
    try {
      rows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CsvRow[];
    } catch {
      return ResponseHelper.badRequest(res, 'Invalid CSV format. Make sure the file has headers.');
    }

    if (rows.length === 0) {
      return ResponseHelper.badRequest(res, 'CSV file is empty');
    }

    // Check required columns
    const required = ['roll_no', 'name', 'email', 'department', 'gender', 'academic_year'];
    const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length > 0) {
      return ResponseHelper.badRequest(res, `Missing columns: ${missing.join(', ')}. Required: roll_no, name, email, department, gender, academic_year, cgpa`);
    }

    // Parse and validate all rows
    const parsed: ParsedStudent[] = [];
    const parseErrors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const { student, error } = validateRow(rows[i], i);
      if (error) {
        parseErrors.push(error);
      } else if (student) {
        parsed.push(student);
      }
    }

    if (parseErrors.length > 0) {
      return ResponseHelper.badRequest(res, `CSV parse errors:\n${parseErrors.join('\n')}`);
    }

    // Check which students already exist in DB
    const rollNos = parsed.map(s => s.roll_no);
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT roll_no FROM Student WHERE roll_no IN (${rollNos.map(() => '?').join(',')})`,
      rollNos
    );
    const existingRolls = new Set(existing.map((r: any) => r.roll_no));

    const preview = parsed.map(s => ({
      ...s,
      status: existingRolls.has(s.roll_no) ? 'existing' : 'new',
    }));

    const newCount = preview.filter(s => s.status === 'new').length;
    const existingCount = preview.filter(s => s.status === 'existing').length;
    const errorCount = preview.filter(s => s.status === 'error').length;

    logSuccess('POST', '/api/admin/csv/upload', `Preview: ${newCount} new, ${existingCount} existing, ${errorCount} errors`);

    return ResponseHelper.success(res, `Parsed ${parsed.length} students`, {
      students: preview,
      summary: { total: parsed.length, new: newCount, existing: existingCount, errors: errorCount },
    });
  } catch (error) {
    logError('POST', '/api/admin/csv/upload', error as Error);
    return ResponseHelper.error(res, 'Failed to parse CSV', 500, (error as Error).message);
  }
};

// POST /api/admin/csv/confirm
// Saves the confirmed student list to DB (upsert on roll_no)
export const confirmCsvImport = async (req: AuthRequest, res: Response): Promise<Response> => {
  logRequest('POST', '/api/admin/csv/confirm');

  const { students } = req.body as { students: ParsedStudent[] };

  if (!students || students.length === 0) {
    return ResponseHelper.badRequest(res, 'No students to import');
  }

  // Only process valid students (skip errors)
  const valid = students.filter(s => s.status !== 'error');

  if (valid.length === 0) {
    return ResponseHelper.badRequest(res, 'No valid students to import');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let inserted = 0;
    let updated = 0;

    for (const s of valid) {
      const [existing] = await conn.query<RowDataPacket[]>(
        'SELECT student_id FROM Student WHERE roll_no = ?',
        [s.roll_no]
      );

      if (existing.length > 0) {
        // Update existing student's CGPA and details (don't touch password/auth)
        await conn.query(
          `UPDATE Student SET name=?, email=?, department=?, gender=?, academic_year=?, cgpa=?
           WHERE roll_no=?`,
          [s.name, s.email, s.department, s.gender, s.academic_year, s.cgpa, s.roll_no]
        );
        updated++;
      } else {
        // Insert new student — no password yet, email_verified=FALSE
        // They will receive a "set password" email or can self-register
        await conn.query<ResultSetHeader>(
          `INSERT INTO Student (roll_no, name, email, department, gender, academic_year, cgpa,
                                is_admin, email_verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
          [s.roll_no, s.name, s.email, s.department, s.gender, s.academic_year, s.cgpa]
        );
        inserted++;
      }
    }

    await conn.commit();

    logSuccess('POST', '/api/admin/csv/confirm', `Imported: ${inserted} new, ${updated} updated`);
    return ResponseHelper.success(res, `Import complete`, {
      inserted,
      updated,
      total: inserted + updated,
    });
  } catch (error) {
    await conn.rollback();
    logError('POST', '/api/admin/csv/confirm', error as Error);
    return ResponseHelper.error(res, 'Import failed', 500, (error as Error).message);
  } finally {
    conn.release();
  }
};
