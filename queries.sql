-- ==========================================

-- Project: Hostel Allotment System
-- Subject: DBMS Lab
-- ==========================================


-- =========================
-- 1. VIEW ALL DATA
-- =========================

SELECT * FROM Student;
SELECT * FROM Hostel;
SELECT * FROM Room;
SELECT * FROM Fee;
SELECT * FROM Application;
SELECT * FROM Allotment;
SELECT * FROM Payment;
SELECT * FROM Complaint;


-- =========================
-- 2. STUDENT QUERIES
-- =========================

-- Applications of a student
SELECT * FROM Application
WHERE student_id = 101;

-- Current room of a student
SELECT r.*
FROM Allotment a
JOIN Room r ON a.room_id = r.room_id
WHERE a.student_id = 101
AND a.vacated_date IS NULL;

-- Allotment history
SELECT * FROM Allotment
WHERE student_id = 101;


-- =========================
-- 3. ROOM & HOSTEL QUERIES
-- =========================

-- Rooms in a hostel
SELECT * FROM Room
WHERE hostel_id = 1;

-- Room occupancy
SELECT room_id, COUNT(*) AS occupied
FROM Allotment
WHERE vacated_date IS NULL
GROUP BY room_id;

-- Available rooms
SELECT r.room_id, r.capacity,
COUNT(a.allotment_id) AS occupied
FROM Room r
LEFT JOIN Allotment a 
ON r.room_id = a.room_id AND a.vacated_date IS NULL
GROUP BY r.room_id
HAVING occupied < r.capacity;


-- =========================
-- 4. APPLICATION QUERIES
-- =========================

-- Students applied for a hostel
SELECT s.name, a.application_id
FROM Application a
JOIN Student s ON a.student_id = s.student_id
WHERE a.preferred_hostel_id = 1;


-- =========================
-- 5. ALLOTMENT OPERATIONS
-- =========================

-- Check active allotment
SELECT *
FROM Allotment
WHERE student_id = 101
AND vacated_date IS NULL;

-- Assign room
INSERT INTO Allotment (
    allotment_id,
    student_id,
    room_id,
    allotment_date,
    status
) VALUES (1, 101, 201, NOW(), 'Active');

-- Vacate room
UPDATE Allotment
SET vacated_date = NOW(), status = 'Vacated'
WHERE student_id = 101
AND vacated_date IS NULL;


-- =========================
-- 6. PAYMENT QUERIES
-- =========================

-- Total paid by student
SELECT student_id, SUM(f.amount) AS total_paid
FROM Payment p
JOIN Fee f ON p.fee_id = f.fee_id
WHERE p.student_id = 101
AND p.status = 'Paid'
GROUP BY student_id;

-- Students with pending payments
SELECT DISTINCT s.student_id, s.name
FROM Student s
JOIN Payment p ON s.student_id = p.student_id
WHERE p.status = 'Pending';


-- =========================
-- 7. COMPLAINT QUERIES
-- =========================

-- Complaints by room
SELECT * FROM Complaint
WHERE room_id = 201;

-- Complaints by student
SELECT * FROM Complaint
WHERE student_id = 101;


-- =========================
-- 8. ADMIN QUERIES
-- =========================

-- Admin of a hostel
SELECT * FROM Admin
WHERE hostel_id = 1;


-- =========================
-- 9. ADVANCED QUERIES
-- =========================

-- Students without allotment
SELECT s.student_id, s.name
FROM Student s
LEFT JOIN Allotment a 
ON s.student_id = a.student_id AND a.vacated_date IS NULL
WHERE a.student_id IS NULL;

-- Most occupied hostel
SELECT h.hostel_name, COUNT(a.allotment_id) AS total_allotted
FROM Hostel h
JOIN Room r ON h.hostel_id = r.hostel_id
JOIN Allotment a ON r.room_id = a.room_id
WHERE a.vacated_date IS NULL
GROUP BY h.hostel_name
ORDER BY total_allotted DESC;

-- Rooms with no students
SELECT r.room_id
FROM Room r
LEFT JOIN Allotment a 
ON r.room_id = a.room_id AND a.vacated_date IS NULL
WHERE a.room_id IS NULL;


-- =========================
-- 10. UPDATE & DELETE
-- =========================

-- Update student phone
UPDATE Student
SET phone = '9999999999'
WHERE student_id = 101;

-- Delete a complaint
DELETE FROM Complaint
WHERE complaint_id = 1;


-- =========================
-- 11. VIEW (IMPORTANT)
-- =========================

CREATE VIEW Current_Allotments AS
SELECT s.name, r.room_number, h.hostel_name
FROM Allotment a
JOIN Student s ON a.student_id = s.student_id
JOIN Room r ON a.room_id = r.room_id
JOIN Hostel h ON r.hostel_id = h.hostel_id
WHERE a.vacated_date IS NULL;


-- =========================
-- 12. TRIGGER (IMPORTANT)
-- =========================

DELIMITER $$

CREATE TRIGGER prevent_double_allotment
BEFORE INSERT ON Allotment
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM Allotment
        WHERE student_id = NEW.student_id
        AND vacated_date IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student already has an active allotment';
    END IF;
END$$

DELIMITER ;


-- =========================
-- END OF FILE
-- =========================