USE hostel_allotment;

-- ==========================================
-- Sample Hostels (2 to start with)
-- ==========================================
INSERT INTO Hostel (hostel_name, hostel_code, type, capacity, floors) VALUES
('Himgiri Hostel',  'HH',  'Boys',  200, 4),
('Saraswati Hostel','SH',  'Girls', 150, 3);

-- ==========================================
-- Sample Rooms — Himgiri (Boys), floors 1-4
-- ==========================================
INSERT INTO Room (hostel_id, room_number, floor, room_type, capacity) VALUES
(1, '101', 1, 'Single', 1),
(1, '102', 1, 'Double', 2),
(1, '103', 1, 'Double', 2),
(1, '104', 1, 'Triple', 3),
(1, '105', 1, 'Single', 1),
(1, '201', 2, 'Single', 1),
(1, '202', 2, 'Double', 2),
(1, '203', 2, 'Double', 2),
(1, '204', 2, 'Triple', 3),
(1, '205', 2, 'Single', 1),
(1, '301', 3, 'Single', 1),
(1, '302', 3, 'Double', 2),
(1, '303', 3, 'Double', 2),
(1, '304', 3, 'Triple', 3),
(1, '401', 4, 'Single', 1),
(1, '402', 4, 'Double', 2),
(1, '403', 4, 'Triple', 3);

-- ==========================================
-- Sample Rooms — Saraswati (Girls), floors 1-3
-- ==========================================
INSERT INTO Room (hostel_id, room_number, floor, room_type, capacity) VALUES
(2, '101', 1, 'Single', 1),
(2, '102', 1, 'Double', 2),
(2, '103', 1, 'Double', 2),
(2, '104', 1, 'Triple', 3),
(2, '201', 2, 'Single', 1),
(2, '202', 2, 'Double', 2),
(2, '203', 2, 'Double', 2),
(2, '204', 2, 'Triple', 3),
(2, '301', 3, 'Double', 2),
(2, '302', 3, 'Double', 2),
(2, '303', 3, 'Triple', 3);

-- ==========================================
-- Sample Students
-- password_hash = bcrypt of 'Password@123'
-- email_verified = TRUE for dev convenience
-- ==========================================
INSERT INTO Student (name, roll_no, email, department, academic_year, gender, cgpa,
                     is_admin, password_hash, email_verified) VALUES
('Admin User',    'ADMIN001', 'admin@nith.ac.in',  'Administration',  2024, 'Male',   NULL,
 TRUE,  '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE),
('Arjun Kumar',   '21CS001',  'arjun@nith.ac.in',  'Computer Science', 2021, 'Male',   8.90,
 FALSE, '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE),
('Rahul Singh',   '21ME003',  'rahul@nith.ac.in',  'Mechanical',       2021, 'Male',   7.80,
 FALSE, '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE),
('Priya Sharma',  '21CS002',  'priya@nith.ac.in',  'Computer Science', 2021, 'Female', 9.20,
 FALSE, '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE),
('Sneha Patel',   '21EC004',  'sneha@nith.ac.in',  'Electronics',      2021, 'Female', 8.50,
 FALSE, '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE),
('Vikram Thakur', '21CE005',  'vikram@nith.ac.in', 'Civil',            2021, 'Male',   8.10,
 FALSE, '$2a$12$NDh9zSAfzpERbIx9CDAHle5bt7cDRN8ziVaEsriD8L.3h7FIxucLC', TRUE);
-- All sample passwords: Password@123
