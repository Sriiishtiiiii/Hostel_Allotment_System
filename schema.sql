-- ==========================================
-- Hostel Allotment System
-- ER Diagram to Relational Schema Mapping
-- ==========================================

-- 1. Hostel
CREATE TABLE Hostel (
    hostel_id INT PRIMARY KEY,
    hostel_name VARCHAR(100),
    type VARCHAR(50),
    capacity INT
);

-- 2. Student
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100),
    roll_no VARCHAR(20),
    department VARCHAR(50),
    academic_year INT,
    gender VARCHAR(10),
    phone VARCHAR(15)
);

-- 3. Room
CREATE TABLE Room (
    room_id INT PRIMARY KEY,
    hostel_id INT,
    room_number INT,
    room_type VARCHAR(50),
    capacity INT,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);

-- 4. Fee
CREATE TABLE Fee (
    fee_id INT PRIMARY KEY,
    hostel_id INT,
    academic_year INT,
    amount INT,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);

-- 5. Application
CREATE TABLE Application (
    application_id INT PRIMARY KEY,
    student_id INT,
    preferred_hostel_id INT,
    preferred_room_type VARCHAR(50),
    applied_date DATETIME,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (preferred_hostel_id) REFERENCES Hostel(hostel_id)
);

-- 6. Allotment
CREATE TABLE Allotment (
    allotment_id INT PRIMARY KEY,
    student_id INT,
    room_id INT,
    allotment_date DATETIME,
    status VARCHAR(20),
    vacated_date DATETIME,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

-- 7. Payment
CREATE TABLE Payment (
    payment_id INT PRIMARY KEY,
    student_id INT,
    fee_id INT,
    payment_date DATETIME,
    mode VARCHAR(20),
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (fee_id) REFERENCES Fee(fee_id)
);

-- 8. Complaint
CREATE TABLE Complaint (
    complaint_id INT PRIMARY KEY,
    student_id INT,
    room_id INT,
    category VARCHAR(50),
    description TEXT,
    raised_date DATETIME,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

-- 9. Admin
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    name VARCHAR(100),
    role VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100),
    hostel_id INT,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);