export interface Student {
  student_id: number;
  name: string;
  roll_no: string;
  department: string;
  academic_year: number;
  gender: 'Male' | 'Female';
  phone: string;
  email?: string;
  cgpa?: number;
  password_hash?: string;
}

export interface Hostel {
  hostel_id: number;
  hostel_name: string;
  type: 'Boys' | 'Girls';
  capacity: number;
  floors?: number;
  rooms_per_floor?: number;
}

export interface Room {
  room_id: number;
  hostel_id: number;
  room_number: string;
  floor?: number;
  room_type: 'Single' | 'Double' | 'Triple';
  capacity: number;
  is_reserved?: boolean;
  reserved_category?: string;
}

export interface Application {
  application_id: number;
  student_id: number;
  preferred_hostel_id: number;
  preferred_room_type: string;
  applied_date: Date;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

export interface Allotment {
  allotment_id: number;
  student_id: number;
  room_id: number;
  allotment_date: Date;
  status: 'Active' | 'Vacated';
  vacated_date?: Date;
  reason?: string;
}

export interface Fee {
  fee_id: number;
  hostel_id: number;
  academic_year: number;
  amount: number;
}

export interface Payment {
  payment_id: number;
  student_id: number;
  fee_id: number;
  allotment_id?: number;
  payment_date: Date;
  mode: 'Online' | 'Cash' | 'Cheque' | 'UPI';
  status: 'Pending' | 'Completed' | 'Failed';
  transaction_id?: string;
}

export interface Complaint {
  complaint_id: number;
  student_id: number;
  room_id: number;
  category: 'Maintenance' | 'Cleanliness' | 'Electrical' | 'Plumbing' | 'Other';
  description: string;
  raised_date: Date;
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

export interface Admin {
  admin_id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  hostel_id?: number;
  password_hash?: string;
}

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}
