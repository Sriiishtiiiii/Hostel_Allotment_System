# Hostel Allotment System  
### Database Management Systems (DBMS) Project

---

## 1. Introduction

The **Hostel Allotment System** is a database-oriented project developed to model and manage the complete hostel allocation process in an educational institution. The system captures real-world constraints and operational workflows such as student applications, administrative approvals, room allotments, fee management, payment tracking, complaint handling, and allotment history maintenance.

The project focuses on **conceptual database design**, **entity–relationship modeling**, and **relational schema normalization** in accordance with standard DBMS principles.

---

## 2. Objectives

- To design a **well-structured relational database** for hostel management
- To apply **Entity–Relationship (ER) modeling** techniques
- To eliminate data redundancy through **normalization up to Third Normal Form (3NF)**
- To represent real-world constraints using keys and relationships
- To provide a scalable and extensible database schema

---

## 3. Scope of the System

The system covers the following functional areas:

- Student information management
- Hostel and room administration
- Application-based hostel allotment
- Administrative approval and control
- Fee structure and payment tracking
- Complaint and maintenance handling
- Allotment history preservation

---

## 4. Entity Description

### 4.1 Student
Stores information related to students such as roll number, department, academic year, gender, and contact details.

### 4.2 Hostel
Represents hostels within the institution, including hostel type and total capacity.

### 4.3 Room
Maintains room-level information such as room number, room type, and capacity, associated with a specific hostel.

### 4.4 Application
Records hostel allotment requests submitted by students prior to approval.

### 4.5 Admin
Represents hostel authorities responsible for approving applications and managing allotments.

### 4.6 Allotment
Acts as a relationship entity between Student and Room, storing both active and past allotment records.

### 4.7 Fee
Defines hostel fee structure based on academic year.

### 4.8 Payment
Tracks payments made by students towards hostel fees.

### 4.9 Complaint
Stores complaints related to hostel rooms or facilities raised by students.

---

## 5. Relationships Overview

- One **Hostel** can contain multiple **Rooms**
- One **Student** can submit multiple **Applications**
- One **Admin** can approve multiple **Allotments**
- One **Student** can have multiple **Payments** and **Complaints**
- One **Room** can have multiple **Allotments** over time
- One **Fee** can be associated with multiple **Payments**

---

## 6. Database Design and Normalization

The database schema is designed to satisfy the following normal forms:

- **First Normal Form (1NF)**:  
  All attributes contain atomic values and no repeating groups exist.

- **Second Normal Form (2NF)**:  
  All non-key attributes are fully functionally dependent on the primary key.

- **Third Normal Form (3NF)**:  
  No transitive dependencies exist among non-key attributes.

Thus, the database is normalized up to **Third Normal Form (3NF)**.

---

## 7. Constraints and Assumptions

- A student can have **only one active allotment** at a time
- Room occupancy cannot exceed room capacity
- Student gender must match hostel type
- Historical allotment data is preserved using vacated date and status attributes
- All relationships are enforced using primary and foreign key constraints

---

## 8. ER Diagram

The Entity–Relationship diagram visually represents all entities, attributes, primary keys, foreign keys, and relationships used in the system.

*(ER diagram designed using MySQL Workbench)*

---
