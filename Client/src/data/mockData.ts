// Types based on ERD
export interface Student {
  id: number;
  name: string;
  rollNo: string;
  department: string;
  academicYear: number;
  gender: 'Male' | 'Female';
  phone: string;
  cgpa: number;
  allocationStatus: 'Not Applied' | 'Applied' | 'Allotted' | 'Rejected';
  email: string;
}

export interface Hostel {
  id: number;
  name: string;
  type: 'Boys' | 'Girls';
  capacity: number;
  floors: number;
  roomsPerFloor: number;
}

export interface Room {
  id: number;
  hostelId: number;
  roomNumber: string;
  floor: number;
  roomType: 'Single' | 'Double' | 'Triple';
  capacity: number;
  isReserved: boolean;
  reservedCategory?: string;
  occupants: string[];
}

export interface Application {
  id: number;
  studentId: number;
  preferredHostelId: number;
  preferredRoomType: 'Single' | 'Double' | 'Triple';
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Allotment {
  id: number;
  studentId: number;
  roomId: number;
  allotmentDate: string;
  status: 'Active' | 'Vacated';
  vacatedDate?: string;
  reason?: string;
}

export interface Fee {
  id: number;
  hostelId: number;
  academicYear: number;
  amount: number;
}

export interface Payment {
  id: number;
  studentId: number;
  feeId: number;
  paymentDate: string;
  mode: 'Online' | 'Cash' | 'Cheque' | 'UPI';
  status: 'Pending' | 'Completed' | 'Failed';
  allotmentId: number;
  amount: number;
  transactionId?: string;
}

export interface Complaint {
  id: number;
  studentId: number;
  roomId: number;
  category: 'Maintenance' | 'Cleanliness' | 'Electrical' | 'Plumbing' | 'Other';
  description: string;
  raisedDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

export interface Admin {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  hostelId?: number;
}

// Mock Data
export const hostels: Hostel[] = [
  { id: 1, name: 'Narmada Hostel', type: 'Boys', capacity: 200, floors: 4, roomsPerFloor: 10 },
  { id: 2, name: 'Ganga Hostel', type: 'Boys', capacity: 150, floors: 3, roomsPerFloor: 10 },
  { id: 3, name: 'Kaveri Hostel', type: 'Girls', capacity: 180, floors: 4, roomsPerFloor: 9 },
  { id: 4, name: 'Yamuna Hostel', type: 'Girls', capacity: 120, floors: 3, roomsPerFloor: 8 },
];

// Generate rooms for each hostel
export const generateRooms = (hostel: Hostel): Room[] => {
  const rooms: Room[] = [];
  let roomId = hostel.id * 1000;

  for (let floor = 1; floor <= hostel.floors; floor++) {
    for (let room = 1; room <= hostel.roomsPerFloor; room++) {
      const roomNumber = `${floor}${String(room).padStart(2, '0')}`;
      const isOccupied = Math.random() > 0.4;
      const isReserved = !isOccupied && Math.random() > 0.7;
      const roomTypes: Room['roomType'][] = ['Single', 'Double', 'Triple'];
      const roomType = roomTypes[Math.floor(Math.random() * 3)];
      const capacity = roomType === 'Single' ? 1 : roomType === 'Double' ? 2 : 3;

      rooms.push({
        id: roomId++,
        hostelId: hostel.id,
        roomNumber,
        floor,
        roomType,
        capacity,
        isReserved,
        reservedCategory: isReserved ? 'PWD' : undefined,
        occupants: isOccupied
          ? Array(Math.ceil(Math.random() * capacity))
              .fill(null)
              .map((_, i) => `Student ${roomId}-${i + 1}`)
          : [],
      });
    }
  }
  return rooms;
};

export const allRooms: Room[] = hostels.flatMap(generateRooms);

export const currentStudent: Student = {
  id: 1,
  name: 'Rahul Sharma',
  rollNo: 'CS21B1045',
  department: 'Computer Science',
  academicYear: 2024,
  gender: 'Male',
  phone: '+91 98765 43210',
  cgpa: 8.5,
  allocationStatus: 'Applied',
  email: 'rahul.sharma@university.edu',
};

export const applications: Application[] = [
  { id: 1, studentId: 1, preferredHostelId: 1, preferredRoomType: 'Double', appliedDate: '2024-06-15', status: 'Pending' },
  { id: 2, studentId: 2, preferredHostelId: 1, preferredRoomType: 'Single', appliedDate: '2024-06-14', status: 'Approved' },
  { id: 3, studentId: 3, preferredHostelId: 2, preferredRoomType: 'Triple', appliedDate: '2024-06-13', status: 'Pending' },
  { id: 4, studentId: 4, preferredHostelId: 3, preferredRoomType: 'Double', appliedDate: '2024-06-12', status: 'Rejected' },
  { id: 5, studentId: 5, preferredHostelId: 3, preferredRoomType: 'Single', appliedDate: '2024-06-11', status: 'Approved' },
];

export const students: Student[] = [
  currentStudent,
  { id: 2, name: 'Priya Patel', rollNo: 'EC21B1023', department: 'Electronics', academicYear: 2024, gender: 'Female', phone: '+91 98765 43211', cgpa: 9.1, allocationStatus: 'Allotted', email: 'priya.patel@university.edu' },
  { id: 3, name: 'Amit Kumar', rollNo: 'ME21B1067', department: 'Mechanical', academicYear: 2024, gender: 'Male', phone: '+91 98765 43212', cgpa: 7.8, allocationStatus: 'Applied', email: 'amit.kumar@university.edu' },
  { id: 4, name: 'Sneha Reddy', rollNo: 'CE21B1089', department: 'Civil', academicYear: 2024, gender: 'Female', phone: '+91 98765 43213', cgpa: 8.9, allocationStatus: 'Rejected', email: 'sneha.reddy@university.edu' },
  { id: 5, name: 'Vikram Singh', rollNo: 'IT21B1034', department: 'IT', academicYear: 2024, gender: 'Male', phone: '+91 98765 43214', cgpa: 8.2, allocationStatus: 'Allotted', email: 'vikram.singh@university.edu' },
];

export const fees: Fee[] = [
  { id: 1, hostelId: 1, academicYear: 2024, amount: 45000 },
  { id: 2, hostelId: 2, academicYear: 2024, amount: 42000 },
  { id: 3, hostelId: 3, academicYear: 2024, amount: 48000 },
  { id: 4, hostelId: 4, academicYear: 2024, amount: 46000 },
];

export const payments: Payment[] = [
  { id: 1, studentId: 2, feeId: 1, paymentDate: '2024-07-01', mode: 'Online', status: 'Completed', allotmentId: 1, amount: 45000, transactionId: 'TXN001234' },
  { id: 2, studentId: 5, feeId: 2, paymentDate: '2024-07-02', mode: 'UPI', status: 'Completed', allotmentId: 2, amount: 42000, transactionId: 'TXN001235' },
  { id: 3, studentId: 1, feeId: 1, paymentDate: '', mode: 'Online', status: 'Pending', allotmentId: 0, amount: 45000 },
];

export const complaints: Complaint[] = [
  { id: 1, studentId: 2, roomId: 1003, category: 'Electrical', description: 'Fan not working properly', raisedDate: '2024-07-10', status: 'In Progress' },
  { id: 2, studentId: 5, roomId: 2005, category: 'Plumbing', description: 'Water leakage in bathroom', raisedDate: '2024-07-08', status: 'Open' },
  { id: 3, studentId: 2, roomId: 1003, category: 'Maintenance', description: 'Door lock broken', raisedDate: '2024-07-05', status: 'Resolved' },
  { id: 4, studentId: 1, roomId: 1001, category: 'Cleanliness', description: 'Common area needs cleaning', raisedDate: '2024-07-12', status: 'Open' },
];

export const allotments: Allotment[] = [
  { id: 1, studentId: 2, roomId: 1003, allotmentDate: '2024-06-20', status: 'Active' },
  { id: 2, studentId: 5, roomId: 2005, allotmentDate: '2024-06-22', status: 'Active' },
];

export const admins: Admin[] = [
  { id: 1, name: 'Dr. Rajesh Kumar', role: 'Chief Warden', phone: '+91 98765 00001', email: 'chief.warden@university.edu' },
  { id: 2, name: 'Mr. Suresh Reddy', role: 'Warden - Narmada', phone: '+91 98765 00002', email: 'warden.narmada@university.edu', hostelId: 1 },
  { id: 3, name: 'Mrs. Lakshmi Devi', role: 'Warden - Kaveri', phone: '+91 98765 00003', email: 'warden.kaveri@university.edu', hostelId: 3 },
];

// Dashboard Stats
export const dashboardStats = {
  totalStudents: 450,
  totalApplications: 125,
  pendingApplications: 45,
  totalRooms: 200,
  occupiedRooms: 156,
  availableRooms: 44,
  totalPayments: 890000,
  pendingPayments: 180000,
  openComplaints: 12,
  resolvedComplaints: 89,
};
