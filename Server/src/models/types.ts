export interface Student {
  student_id: number;
  name: string;
  roll_no: string;
  department: string;
  academic_year: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  email: string;
  cgpa?: number;
  is_admin: boolean;
  email_verified?: boolean;
  created_at?: Date;
}

export interface Hostel {
  hostel_id: number;
  hostel_name: string;
  hostel_code?: string;
  type: 'Boys' | 'Girls' | 'Co-ed';
  capacity: number;
  floors: number;
  created_at?: Date;
}

export interface Room {
  room_id: number;
  hostel_id: number;
  room_number: string;
  floor: number;
  room_type: 'Single' | 'Double' | 'Triple';
  capacity: number;
  current_occupancy?: number;
  created_at?: Date;
}

// Room with occupancy info (used in grid view)
export interface RoomWithOccupancy extends Room {
  current_occupancy: number;
  available_slots: number;
  is_full: boolean;
}

export interface Allotment {
  allotment_id: number;
  student_id: number;
  room_id: number;
  allotment_date: Date;
  status: 'Active' | 'Vacated';
  vacated_date?: Date;
  reason?: string;
  // Joined fields
  student_name?: string;
  roll_no?: string;
  room_number?: string;
  hostel_name?: string;
  floor?: number;
  room_type?: string;
}

export interface AllotmentRound {
  round_id: number;
  round_number: number;
  academic_year: number;
  batch_size: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  window_hours: number;
  activated_at?: Date;
  processed_at?: Date;
  created_at?: Date;
  // Computed fields
  total_students?: number;
  submitted_count?: number;
  allotted_count?: number;
}

export interface RoundStudent {
  id: number;
  round_id: number;
  student_id: number;
  notified: boolean;
  // Joined fields
  name?: string;
  roll_no?: string;
  cgpa?: number;
  department?: string;
  gender?: string;
  has_submitted?: boolean;
  allotted_room?: string;
}

export interface RoomPreference {
  pref_id: number;
  student_id: number;
  round_id: number;
  priority_1_room_id: number;
  priority_2_room_id?: number;
  priority_3_room_id?: number;
  submitted_at: Date;
  status: 'Pending' | 'Allotted' | 'Unresolved';
  allotted_room_id?: number;
}

export interface Complaint {
  complaint_id: number;
  student_id: number;
  room_id: number;
  category: 'Electrical' | 'Plumbing' | 'Cleaning' | 'Other';
  description: string;
  raised_date: Date;
  status: 'Open' | 'In Progress' | 'Resolved';
  // Joined fields
  student_name?: string;
  room_number?: string;
  hostel_name?: string;
}

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  student_id: number;
  email: string;
  name: string;
  roll_no: string;
  is_admin: boolean;
}
