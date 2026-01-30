USE hostel_allotment;

-- Sample Hostels
INSERT INTO Hostel (hostel_id, hostel_name, type, capacity) VALUES
(1, 'Ramanujan Hostel', 'Boys', 200),
(2, 'Saraswati Hostel', 'Girls', 150),
(3, 'APJ Abdul Kalam Hostel', 'Boys', 180),
(4, 'Indira Gandhi Hostel', 'Girls', 120);

-- Sample Students
INSERT INTO Student (student_id, name, roll_no, department, academic_year, gender, phone, email, cgpa) VALUES
(1, 'Arjun Kumar', '21CS001', 'Computer Science', 2021, 'Male', '9876543210', 'arjun@college.edu', 8.5),
(2, 'Priya Sharma', '21CS002', 'Computer Science', 2021, 'Female', '9876543211', 'priya@college.edu', 9.2),
(3, 'Rahul Singh', '21ME003', 'Mechanical', 2021, 'Male', '9876543212', 'rahul@college.edu', 7.8),
(4, 'Sneha Patel', '21EC004', 'Electronics', 2021, 'Female', '9876543213', 'sneha@college.edu', 8.9);

-- Sample Rooms
INSERT INTO Room (room_id, hostel_id, room_number, room_type, capacity) VALUES
(101, 1, 'A101', 'Single', 1),
(102, 1, 'A102', 'Double', 2),
(103, 1, 'A103', 'Triple', 3),
(201, 2, 'B201', 'Single', 1),
(202, 2, 'B202', 'Double', 2),
(301, 3, 'C301', 'Single', 1),
(401, 4, 'D401', 'Double', 2);

-- Sample Fees
INSERT INTO Fee (fee_id, hostel_id, academic_year, amount) VALUES
(1, 1, 2021, 50000),
(2, 2, 2021, 45000),
(3, 3, 2021, 48000),
(4, 4, 2021, 42000);

-- Sample Applications
INSERT INTO Application (application_id, student_id, preferred_hostel_id, preferred_room_type, applied_date, status) VALUES
(1, 1, 1, 'Single', '2024-01-15 10:30:00', 'Approved'),
(2, 2, 2, 'Double', '2024-01-16 11:15:00', 'Pending'),
(3, 3, 3, 'Single', '2024-01-17 09:45:00', 'Pending'),
(4, 4, 4, 'Double', '2024-01-18 14:20:00', 'Approved');

-- Sample Allotments
INSERT INTO Allotment (allotment_id, student_id, room_id, allotment_date, status, vacated_date) VALUES
(1, 1, 101, '2024-01-20 15:00:00', 'Active', NULL),
(2, 4, 401, '2024-01-22 16:30:00', 'Active', NULL);

-- Sample Payments
INSERT INTO Payment (payment_id, student_id, fee_id, payment_date, mode, status) VALUES
(1, 1, 1, '2024-01-25 12:00:00', 'Online', 'Paid'),
(2, 2, 2, NULL, 'Online', 'Pending'),
(3, 4, 4, '2024-01-26 10:30:00', 'Online', 'Paid');

-- Sample Complaints
INSERT INTO Complaint (complaint_id, student_id, room_id, category, description, raised_date, status) VALUES
(1, 1, 101, 'Maintenance', 'AC not working properly', '2024-01-28 09:00:00', 'Open'),
(2, 4, 401, 'Electrical', 'Power outlet not functioning', '2024-01-27 14:30:00', 'In Progress');

-- Sample Admin
INSERT INTO Admin (admin_id, name, role, phone, email, hostel_id) VALUES
(1, 'Dr. Rajesh Kumar', 'Warden', '9999999999', 'admin@college.edu', 1);