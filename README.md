
# Hostel Allotment System 

---

## 1. Overview

The **Hostel Allotment System** is a database-driven application designed to simulate a **real-world hostel allocation process using CGPA-based priority rounds**.

The system introduces a **controlled, round-based allocation mechanism**, where students are grouped by merit and given a **fixed 5-minute window** to select room preferences. Allocation is performed fairly based on priority and availability.

---

## 2. Core Concept

* Students are ranked based on **CGPA**
* Top students are grouped into **batches (default: 5 students per round)**
* Each batch gets a **5-minute preference submission window**
* Students submit **up to 5 room preferences**
* Rooms are allotted based on:

  * Priority order (P1 → P5)
  * Room availability

---

## 3. Key Features

* Merit-based (CGPA) prioritization
* Round-based controlled allocation
* Time-constrained preference submission
* Multi-level room preference system
* Conflict-free allocation mechanism
* Historical allotment tracking
* Complaint management system
* Authentication-ready schema (JWT-based)

---

## 4. Database Schema Overview

### Core Tables

* **Student** – includes CGPA, authentication, and role control
* **Hostel** – hostel details and type
* **Room** – linked to hostel with capacity constraints
* **Allotment** – stores active and past allocations
* **AllotmentRound** – manages batch-based rounds
* **RoundStudent** – maps students to rounds
* **RoomPreference** – stores top 5 choices per student
* **Complaint** – tracks issues raised by students


---

## 5. System Workflow

```mermaid
flowchart TD
    A[Start] --> B[Fetch Students]
    B --> C[Sort by CGPA Desc]
    C --> D[Create Batches of 5]
    D --> E[Create Allotment Rounds]

    E --> F[Admin Activates Round]
    F --> G[Notify Students]
    G --> H[Students Submit Preferences - 5 min window]

    H --> I[Admin Ends Round]
    I --> J[Run Allocation Algorithm]

    J --> K[Store Allotments]
    K --> L[Mark Round Completed]

    L --> M{More Rounds?}
    M -->|Yes| F
    M -->|No| N[End]
```

---

## 6. Detailed Allocation Logic

```mermaid
flowchart TD
    A[Start Allocation] --> B[Pick Student]
    B --> C[Check Priority 1]

    C --> D{Room Available?}
    D -->|Yes| E[Assign Room]

    D -->|No| F[Check Priority 2]
    F --> G{Available?}
    G -->|Yes| E

    G -->|No| H[Check Priority 3]
    H --> I{Available?}
    I -->|Yes| E

    I -->|No| J[Check Priority 4]
    J --> K{Available?}
    K -->|Yes| E

    K -->|No| L[Check Priority 5]
    L --> M{Available?}
    M -->|Yes| E

    M -->|No| N[Mark Unresolved]

    E --> O[Create Allotment Record]
    O --> P[End for Student]
    N --> P
```

---

## 7. Admin Role (System Controller)

The **Admin** is the **central authority controlling the entire system workflow**.

### Responsibilities

* Creates and manages **Allotment Rounds**
* Starts and ends each round manually
* Controls the **5-minute submission window**
* Monitors student participation
* Triggers allocation process
* Handles unresolved cases and system issues

---

## 8. Round Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Upcoming
    Upcoming --> Active : Admin activates
    Active --> Completed : Admin ends + allocation done
    Completed --> [*]
```

---

## 9. ER Diagram (Simplified)

```mermaid
erDiagram
    ADMIN ||--o{ ALLOTMENT_ROUND : controls

    STUDENT ||--o{ ROUND_STUDENT : participates
    ALLOTMENT_ROUND ||--o{ ROUND_STUDENT : includes

    STUDENT ||--o{ ROOM_PREFERENCE : submits
    ALLOTMENT_ROUND ||--o{ ROOM_PREFERENCE : belongs_to

    HOSTEL ||--o{ ROOM : has

    ROOM ||--o{ ALLOTMENT : assigned
    STUDENT ||--o{ ALLOTMENT : gets

    STUDENT ||--o{ COMPLAINT : raises
    COMPLAINT }o--|| ROOM : about
```

---

## 10. Constraints & Rules

* A student can have **only one active allotment**
* Room capacity must not be exceeded
* Preferences can be submitted **only once per round**
* Allocation strictly follows **P1 → P5 priority order**
* Hostel type must match student gender
* Admin must **start and end each round manually**

---

## 11. Design Decisions

### Round-Based Allocation

* Prevents race conditions
* Ensures fairness
* Mimics real counselling systems

### Multi-Preference System

* Reduces allocation failure
* Improves efficiency

### Admin-Controlled Execution

* Ensures strict timing
* Prevents misuse
* Provides manual override

---

## 12. Technologies & Concepts Used

* Relational Database Design
* Normalization (up to 3NF)
* Primary & Foreign Keys
* Unique Constraints
* Indexing
* Transaction-safe logic (conceptual)

---

## 14. Authors

**Shubham Anand (23BCS109)**
**Soham Juneja (23BCS110)**
**Srishti Chamoli (23BCS111)**
**Subhash Bharti (23BCS112)**


