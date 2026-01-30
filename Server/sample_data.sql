-- Sample Data for Hostel Allotment System

-- Insert Hostels
INSERT INTO Hostel (hostel_id, hostel_name, type, capacity) VALUES
(1, 'Narmada Hostel', 'Boys', 200),
(2, 'Ganga Hostel', 'Boys', 150),
(3, 'Kaveri Hostel', 'Girls', 180),
(4, 'Yamuna Hostel', 'Girls', 120);

-- Insert Students
INSERT INTO Student (student_id, name, roll_no, department, academic_year, gender, phone, email, cgpa) VALUES
(1, 'Rahul Sharma', '2021CS001', 'Computer Science', 2021, 'Male', '9876543210', 'rahul@example.com', 8.5),
(2, 'Priya Patel', '2021CS002', 'Computer Science', 2021, 'Female', '9876543211', 'priya@example.com', 9.0),
(3, 'Amit Kumar', '2021ME001', 'Mechanical Engineering', 2021, 'Male', '9876543212', 'amit@example.com', 7.8),
(4, 'Sneha Reddy', '2021EC001', 'Electronics', 2021, 'Female', '9876543213', 'sneha@example.com', 8.2),
(5, 'Vikram Singh', '2022CS001', 'Computer Science', 2022, 'Male', '9876543214', 'vikram@example.com', 8.8);

-- Insert Rooms
INSERT INTO Room (room_id, hostel_id, room_number, room_type, capacity) VALUES
-- Narmada Hostel (Boys)
(1, 1, '101', 'Double', 2),
(2, 1, '102', 'Triple', 3),
(3, 1, '103', 'Single', 1),
(4, 1, '201', 'Double', 2),
(5, 1, '202', 'Triple', 3),
-- Ganga Hostel (Boys)
(6, 2, '101', 'Double', 2),
(7, 2, '102', 'Double', 2),
(8, 2, '201', 'Triple', 3),
-- Kaveri Hostel (Girls)
(9, 3, '101', 'Double', 2),
(10, 3, '102', 'Triple', 3),
(11, 3, '103', 'Single', 1),
(12, 3, '201', 'Double', 2),
-- Yamuna Hostel (Girls)
(13, 4, '101', 'Double', 2),
(14, 4, '102', 'Double', 2),
(15, 4, '201', 'Single', 1);

-- Insert Fees
INSERT INTO Fee (fee_id, hostel_id, academic_year, amount) VALUES
(1, 1, 2024, 50000),
(2, 2, 2024, 48000),
(3, 3, 2024, 52000),
(4, 4, 2024, 50000),
(5, 1, 2025, 55000),
(6, 2, 2025, 53000),
(7, 3, 2025, 57000),
(8, 4, 2025, 55000);

-- Insert Admin
INSERT INTO Admin (admin_id, name, role, phone, email, hostel_id) VALUES
(1, 'Dr. Rajesh Kumar', 'Chief Warden', '9999999999', 'admin@hostel.com', NULL),
(2, 'Mr. Suresh Mehta', 'Warden', '9999999998', 'warden1@hostel.com', 1),
(3, 'Mrs. Lakshmi Iyer', 'Warden', '9999999997', 'warden2@hostel.com', 3);

-- Insert Applications
INSERT INTO Application (application_id, student_id, preferred_hostel_id, preferred_room_type, applied_date, status) VALUES
(1, 1, 1, 'Double', '2024-01-15 10:00:00', 'Approved'),
(2, 2, 3, 'Single', '2024-01-16 11:30:00', 'Approved'),
(3, 3, 1, 'Triple', '2024-01-17 09:00:00', 'Pending'),
(4, 4, 3, 'Double', '2024-01-18 14:00:00', 'Approved'),
(5, 5, 2, 'Double', '2024-01-19 10:30:00', 'Approved');

-- Insert Allotments
INSERT INTO Allotment (allotment_id, student_id, room_id, allotment_date, status) VALUES
(1, 1, 1, '2024-01-20 10:00:00', 'Active'),
(2, 2, 11, '2024-01-21 10:00:00', 'Active'),
(3, 4, 9, '2024-01-22 10:00:00', 'Active'),
(4, 5, 6, '2024-01-23 10:00:00', 'Active');

-- Insert Payments
INSERT INTO Payment (payment_id, student_id, fee_id, payment_date, mode, status) VALUES
(1, 1, 1, '2024-01-25 12:00:00', 'UPI', 'Completed'),
(2, 2, 3, '2024-01-26 13:00:00', 'Online', 'Completed'),
(3, 4, 3, '2024-01-27 11:00:00', 'UPI', 'Completed'),
(4, 5, 2, '2024-01-28 10:00:00', 'Online', 'Pending');

-- Insert Complaints
INSERT INTO Complaint (complaint_id, student_id, room_id, category, description, raised_date, status) VALUES
(1, 1, 1, 'Electrical', 'Fan not working properly', '2024-02-01 09:00:00', 'In Progress'),
(2, 2, 11, 'Plumbing', 'Tap is leaking', '2024-02-02 10:00:00', 'Open'),
(3, 4, 9, 'Cleanliness', 'Room needs cleaning', '2024-02-03 11:00:00', 'Resolved');
