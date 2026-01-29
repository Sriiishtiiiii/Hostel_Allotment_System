-- ==========================================
-- Hostel Allotment System
-- ER Diagram to Relational Schema Mapping
-- Database: MySQL
-- ==========================================

-- 1. Hostel
CREATE TABLE Hostel (
    hostel_id INT PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL
);

-- 2. Student
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    academic_year INT NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(15)
);

-- 3. Room
CREATE TABLE Room (
    room_id INT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number INT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);

-- 4. Fee
CREATE TABLE Fee (
    fee_id INT PRIMARY KEY,
    hostel_id INT NOT NULL,
    academic_year INT NOT NULL,
    amount INT NOT NULL,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);

-- 5. Application
CREATE TABLE Application (
    application_id INT PRIMARY KEY,
    student_id INT NOT NULL,
    preferred_hostel_id INT NOT NULL,
    preferred_room_type VARCHAR(50),
    applied_date DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (preferred_hostel_id) REFERENCES Hostel(hostel_id)
);

-- 6. Allotment
CREATE TABLE Allotment (
    allotment_id INT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    allotment_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    vacated_date DATETIME,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

-- 7. Payment
CREATE TABLE Payment (
    payment_id INT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_id INT NOT NULL,
    payment_date DATETIME NOT NULL,
    mode VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (fee_id) REFERENCES Fee(fee_id)
);

-- 8. Complaint
CREATE TABLE Complaint (
    complaint_id INT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    raised_date DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);

-- 9. Admin
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    hostel_id INT NOT NULL,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);
