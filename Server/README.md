# Hostel Allotment System - Backend API

A RESTful API backend for the Hostel Allotment System built with Node.js, Express, TypeScript, and MySQL.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Student/Admin)
- 🏠 Complete hostel management
- 🚪 Room allocation and management
- 📝 Application processing
- 💰 Payment tracking
- 🔧 Complaint management
- 📊 Comprehensive reporting

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials and configuration.

3. Create the database and run the schema:
```bash
# Create database in MySQL
mysql -u root -p -e "CREATE DATABASE hostel_allotment;"

# Import schema
mysql -u root -p hostel_allotment < ../schema.sql
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (student/admin)
- `GET /api/auth/profile` - Get user profile (authenticated)

### Students
- `GET /api/students` - Get all students (authenticated)
- `GET /api/students/:id` - Get student by ID (authenticated)
- `POST /api/students` - Create student (admin only)
- `PUT /api/students/:id` - Update student (admin only)
- `DELETE /api/students/:id` - Delete student (admin only)

### Hostels
- `GET /api/hostels` - Get all hostels (authenticated)
- `GET /api/hostels/:id` - Get hostel by ID (authenticated)
- `POST /api/hostels` - Create hostel (admin only)
- `PUT /api/hostels/:id` - Update hostel (admin only)
- `DELETE /api/hostels/:id` - Delete hostel (admin only)

### Rooms
- `GET /api/rooms` - Get all rooms (authenticated)
- `GET /api/rooms/:id` - Get room by ID (authenticated)
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Applications
- `GET /api/applications` - Get all applications (authenticated)
- `GET /api/applications/:id` - Get application by ID (authenticated)
- `POST /api/applications` - Create application (authenticated)
- `PUT /api/applications/:id` - Update application status (admin only)
- `DELETE /api/applications/:id` - Delete application (authenticated)

### Allotments
- `GET /api/allotments` - Get all allotments (authenticated)
- `GET /api/allotments/:id` - Get allotment by ID (authenticated)
- `POST /api/allotments` - Create allotment (admin only)
- `PUT /api/allotments/:id` - Update allotment (admin only)
- `DELETE /api/allotments/:id` - Delete allotment (admin only)

### Payments
- `GET /api/payments` - Get all payments (authenticated)
- `GET /api/payments/:id` - Get payment by ID (authenticated)
- `POST /api/payments` - Create payment (authenticated)
- `PUT /api/payments/:id` - Update payment (admin only)
- `DELETE /api/payments/:id` - Delete payment (admin only)

### Complaints
- `GET /api/complaints` - Get all complaints (authenticated)
- `GET /api/complaints/:id` - Get complaint by ID (authenticated)
- `POST /api/complaints` - Create complaint (authenticated)
- `PUT /api/complaints/:id` - Update complaint status (admin only)
- `DELETE /api/complaints/:id` - Delete complaint (authenticated)

### Fees
- `GET /api/fees` - Get all fees (authenticated)
- `GET /api/fees/:id` - Get fee by ID (authenticated)
- `POST /api/fees` - Create fee (admin only)
- `PUT /api/fees/:id` - Update fee (admin only)
- `DELETE /api/fees/:id` - Delete fee (admin only)

## Authentication

All API requests (except login) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "role": "student"
  }'
```

## Project Structure

```
Server/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/             # Request handlers
│   │   ├── authController.ts
│   │   ├── studentController.ts
│   │   ├── hostelController.ts
│   │   ├── roomController.ts
│   │   ├── applicationController.ts
│   │   ├── allotmentController.ts
│   │   ├── paymentController.ts
│   │   ├── complaintController.ts
│   │   └── feeController.ts
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces
│   ├── routes/                  # API routes
│   │   ├── authRoutes.ts
│   │   ├── studentRoutes.ts
│   │   ├── hostelRoutes.ts
│   │   ├── roomRoutes.ts
│   │   ├── applicationRoutes.ts
│   │   ├── allotmentRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   ├── complaintRoutes.ts
│   │   └── feeRoutes.ts
│   ├── utils/
│   │   └── auth.ts              # Auth utilities
│   └── server.ts                # Main server file
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── tsconfig.json
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet for security headers
- CORS configuration
- Role-based access control
- Input validation

## License

MIT
