USE hostel_allotment;

-- ==========================================
-- Sample Hostels
-- ==========================================
INSERT INTO Hostel (hostel_name, type, capacity) VALUES
('Ramanujan Hostel', 'Boys', 200),
('Saraswati Hostel', 'Girls', 150),
('APJ Abdul Kalam Hostel', 'Boys', 180),
('Indira Gandhi Hostel', 'Girls', 120);

-- ==========================================
-- Sample Students (Clerk Integrated)
-- clerk_id is required
-- ==========================================
INSERT INTO Student 
(clerk_id, name, roll_no, department, academic_year, gender, phone, email, cgpa, is_admin)
VALUES
('clerk_001', 'Arjun Kumar', '21CS001', 'Computer Science', 2021, 'Male', '9876543210', 'arjun@college.edu', 8.5, FALSE),
('clerk_002', 'Priya Sharma', '21CS002', 'Computer Science', 2021, 'Female', '9876543211', 'priya@college.edu', 9.2, FALSE),
('clerk_003', 'Rahul Singh', '21ME003', 'Mechanical', 2021, 'Male', '9876543212', 'rahul@college.edu', 7.8, FALSE),
('clerk_004', 'Sneha Patel', '21EC004', 'Electronics', 2021, 'Female', '9876543213', 'sneha@college.edu', 8.9, FALSE);

-- ==========================================
-- Sample Rooms
-- ==========================================
INSERT INTO Room (hostel_id, room_number, room_type, capacity) VALUES
(1, 'A101', 'Single', 1),
(1, 'A102', 'Double', 2),
(1, 'A103', 'Triple', 3),
(2, 'B201', 'Single', 1),
(2, 'B202', 'Double', 2),
(3, 'C301', 'Single', 1),
(4, 'D401', 'Double', 2);

-- ==========================================
-- Sample Fees
-- ==========================================
INSERT INTO Fee (hostel_id, academic_year, amount) VALUES
(1, 2021, 50000),
(2, 2021, 45000),
(3, 2021, 48000),
(4, 2021, 42000);

-- ==========================================
-- Sample Applications
-- Status ENUM: 'Pending', 'Approved', 'Rejected'
-- ==========================================
INSERT INTO Application 
(student_id, preferred_hostel_id, preferred_room_type, applied_date, status)
VALUES
(1, 1, 'Single', '2024-01-15 10:30:00', 'Approved'),
(2, 2, 'Double', '2024-01-16 11:15:00', 'Pending'),
(3, 3, 'Single', '2024-01-17 09:45:00', 'Pending'),
(4, 4, 'Double', '2024-01-18 14:20:00', 'Approved');

-- ==========================================
-- Sample Allotments
-- Status ENUM: 'Active', 'Vacated'
-- ==========================================
INSERT INTO Allotment 
(student_id, room_id, allotment_date, status, vacated_date, reason)
VALUES
(1, 1, '2024-01-20 15:00:00', 'Active', NULL, NULL),
(4, 7, '2024-01-22 16:30:00', 'Active', NULL, NULL);

-- ==========================================
-- Sample Payments
-- Mode ENUM: 'UPI', 'Card', 'Cash', 'NetBanking'
-- Status ENUM: 'Pending', 'Completed', 'Failed'
-- ==========================================
INSERT INTO Payment 
(student_id, fee_id, payment_date, mode, status)
VALUES
(1, 1, '2024-01-25 12:00:00', 'UPI', 'Completed'),
(2, 2, NULL, 'Card', 'Pending'),
(4, 4, '2024-01-26 10:30:00', 'NetBanking', 'Completed');

-- ==========================================
-- Sample Complaints
-- Category ENUM: 'Electrical', 'Plumbing', 'Cleaning', 'Other'
-- Status ENUM: 'Open', 'In Progress', 'Resolved'
-- ==========================================
INSERT INTO Complaint 
(student_id, room_id, category, description, raised_date, status)
VALUES
(1, 1, 'Electrical', 'AC not working properly', '2024-01-28 09:00:00', 'Open'),
(4, 7, 'Electrical', 'Power outlet not functioning', '2024-01-27 14:30:00', 'In Progress');

-- ==========================================
-- Sample Admin
-- ==========================================
INSERT INTO Admin (name, role, phone, email, hostel_id) VALUES
('Dr. Rajesh Kumar', 'Warden', '9999999999', 'admin@college.edu', 1);
