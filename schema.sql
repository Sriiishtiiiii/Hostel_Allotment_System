-- ==========================================
-- Hostel Allotment System — NIT Hamirpur
-- Custom JWT Auth (no Clerk)
-- ==========================================

DROP DATABASE IF EXISTS hostel_allotment;
CREATE DATABASE hostel_allotment;
USE hostel_allotment;

-- ==========================================
-- 1. Hostel
-- ==========================================
CREATE TABLE Hostel (
    hostel_id   INT AUTO_INCREMENT PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL,
    hostel_code VARCHAR(10),
    type        ENUM('Boys', 'Girls', 'Co-ed') NOT NULL,
    capacity    INT NOT NULL,
    floors      INT NOT NULL DEFAULT 4,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Student (Custom JWT Auth)
-- ==========================================
CREATE TABLE Student (
    student_id          INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    roll_no             VARCHAR(20) UNIQUE NOT NULL,
    department          VARCHAR(50) NOT NULL,
    academic_year       INT NOT NULL,
    gender              ENUM('Male', 'Female', 'Other') NOT NULL,
    phone               VARCHAR(15),
    email               VARCHAR(100) UNIQUE NOT NULL,
    cgpa                FLOAT,
    is_admin            BOOLEAN DEFAULT FALSE,
    -- Auth fields
    password_hash       VARCHAR(255),
    email_verified      BOOLEAN DEFAULT FALSE,
    verification_token  VARCHAR(255),
    verification_expires DATETIME,
    reset_token         VARCHAR(255),
    reset_token_expires  DATETIME,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_email  ON Student(email);
CREATE INDEX idx_student_roll   ON Student(roll_no);

-- ==========================================
-- 3. Room
-- ==========================================
CREATE TABLE Room (
    room_id     INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id   INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    floor       INT NOT NULL DEFAULT 1,
    room_type   ENUM('Single', 'Double', 'Triple') NOT NULL,
    capacity    INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostel_id, room_number),
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id) ON DELETE CASCADE
);

CREATE INDEX idx_room_hostel ON Room(hostel_id);

-- ==========================================
-- 4. Allotment
-- ==========================================
CREATE TABLE Allotment (
    allotment_id   INT AUTO_INCREMENT PRIMARY KEY,
    student_id     INT NOT NULL,
    room_id        INT NOT NULL,
    allotment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status         ENUM('Active', 'Vacated') DEFAULT 'Active',
    vacated_date   DATETIME NULL,
    reason         TEXT,
    UNIQUE KEY uq_active_student (student_id, status),
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)    REFERENCES Room(room_id)    ON DELETE CASCADE
);

CREATE INDEX idx_allotment_student ON Allotment(student_id);
CREATE INDEX idx_allotment_room    ON Allotment(room_id);

-- ==========================================
-- 5. AllotmentRound  (batch management)
-- ==========================================
CREATE TABLE AllotmentRound (
    round_id      INT AUTO_INCREMENT PRIMARY KEY,
    round_number  INT NOT NULL,
    academic_year INT NOT NULL,
    batch_size    INT NOT NULL DEFAULT 20,
    status        ENUM('Upcoming', 'Active', 'Completed') DEFAULT 'Upcoming',
    window_hours  INT DEFAULT 24,
    activated_at  DATETIME NULL,
    processed_at  DATETIME NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. RoundStudent  (which students are in which round)
-- ==========================================
CREATE TABLE RoundStudent (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    round_id   INT NOT NULL,
    student_id INT NOT NULL,
    notified   BOOLEAN DEFAULT FALSE,
    UNIQUE(round_id, student_id),
    FOREIGN KEY (round_id)   REFERENCES AllotmentRound(round_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)      ON DELETE CASCADE
);

-- ==========================================
-- 7. RoomPreference  (student's 3 priorities)
-- ==========================================
CREATE TABLE RoomPreference (
    pref_id            INT AUTO_INCREMENT PRIMARY KEY,
    student_id         INT NOT NULL,
    round_id           INT NOT NULL,
    priority_1_room_id INT NOT NULL,
    priority_2_room_id INT NULL,
    priority_3_room_id INT NULL,
    submitted_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    status             ENUM('Pending', 'Allotted', 'Unresolved') DEFAULT 'Pending',
    allotted_room_id   INT NULL,
    UNIQUE(student_id, round_id),
    FOREIGN KEY (student_id)         REFERENCES Student(student_id)      ON DELETE CASCADE,
    FOREIGN KEY (round_id)           REFERENCES AllotmentRound(round_id) ON DELETE CASCADE,
    FOREIGN KEY (priority_1_room_id) REFERENCES Room(room_id),
    FOREIGN KEY (priority_2_room_id) REFERENCES Room(room_id),
    FOREIGN KEY (priority_3_room_id) REFERENCES Room(room_id),
    FOREIGN KEY (allotted_room_id)   REFERENCES Room(room_id)
);

CREATE INDEX idx_pref_student ON RoomPreference(student_id);
CREATE INDEX idx_pref_round   ON RoomPreference(round_id);

-- ==========================================
-- 8. Complaint
-- ==========================================
CREATE TABLE Complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id   INT NOT NULL,
    room_id      INT NOT NULL,
    category     ENUM('Electrical', 'Plumbing', 'Cleaning', 'Other') NOT NULL,
    description  TEXT NOT NULL,
    raised_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)    REFERENCES Room(room_id)    ON DELETE CASCADE
);

CREATE INDEX idx_complaint_student ON Complaint(student_id);
