-- ==========================================
-- Hostel Allotment System (Production Ready)
-- Clerk Compatible
-- ==========================================

DROP DATABASE IF EXISTS hostel_allotment;
CREATE DATABASE hostel_allotment;
USE hostel_allotment;

-- ==========================================
-- 1. Hostel
-- ==========================================
CREATE TABLE Hostel (
    hostel_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL,
    type ENUM('Boys', 'Girls', 'Co-ed') NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Student (Clerk Integrated)
-- ==========================================
CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    academic_year INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    cgpa FLOAT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_clerk ON Student(clerk_id);

-- ==========================================
-- 3. Room
-- ==========================================
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_type ENUM('Single', 'Double', 'Triple') NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostel_id, room_number),
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_room_hostel ON Room(hostel_id);

-- ==========================================
-- 4. Fee
-- ==========================================
CREATE TABLE Fee (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    academic_year INT NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostel_id, academic_year),
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
        ON DELETE CASCADE
);

-- ==========================================
-- 5. Application
-- ==========================================
CREATE TABLE Application (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    preferred_hostel_id INT NOT NULL,
    preferred_room_type ENUM('Single', 'Double', 'Triple') NOT NULL,
    applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE,
    FOREIGN KEY (preferred_hostel_id) REFERENCES Hostel(hostel_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_application_student ON Application(student_id);

-- ==========================================
-- 6. Allotment
-- ==========================================
CREATE TABLE Allotment (
    allotment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    allotment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Vacated') DEFAULT 'Active',
    vacated_date DATETIME NULL,
    reason TEXT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_allotment_student ON Allotment(student_id);
CREATE INDEX idx_allotment_room ON Allotment(room_id);

-- ==========================================
-- 7. Payment
-- ==========================================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_id INT NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    mode ENUM('UPI', 'Card', 'Cash', 'NetBanking') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE,
    FOREIGN KEY (fee_id) REFERENCES Fee(fee_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_payment_student ON Payment(student_id);

-- ==========================================
-- 8. Complaint
-- ==========================================
CREATE TABLE Complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    category ENUM('Electrical', 'Plumbing', 'Cleaning', 'Other') NOT NULL,
    description TEXT NOT NULL,
    raised_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_complaint_student ON Complaint(student_id);

-- ==========================================
-- 9. Admin
-- ==========================================
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    hostel_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
        ON DELETE SET NULL
);
