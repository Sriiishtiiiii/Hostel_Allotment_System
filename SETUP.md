# Hostel Allotment System - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)

## Database Setup

### Step 1: Start MySQL Server

```bash
# On macOS (if installed via Homebrew)
brew services start mysql

# Or start manually
mysql.server start
```

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hostel_allotment;

# Exit MySQL
exit;
```

### Step 3: Import Schema

```bash
# From the project root directory
mysql -u root -p hostel_allotment < schema.sql

# Import sample data (optional)
mysql -u root -p hostel_allotment < Server/sample_data.sql
```

## Backend Setup

### Step 1: Navigate to Server Directory

```bash
cd Server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Edit the `.env` file with your MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password    # <-- Update this
DB_NAME=hostel_allotment

# Other settings (can keep as is)
PORT=5000
NODE_ENV=development
JWT_SECRET=hostel-allotment-secret-key-2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

You should see:
```
✅ Database connected successfully
🚀 Server is running on port 5000
📍 API Base URL: http://localhost:5000/api
🏥 Health Check: http://localhost:5000/health
```

## Frontend Setup

### Step 1: Navigate to Client Directory

```bash
cd ../Client
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Development Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Testing the API

### Test Health Check

```bash
curl http://localhost:5000/health
```

### Test Login

**Student Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@example.com",
    "password": "any-password",
    "role": "student"
  }'
```

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hostel.com",
    "password": "any-password",
    "role": "admin"
  }'
```

### Test Protected Endpoint

```bash
# Get all hostels (replace <token> with the token from login)
curl http://localhost:5000/api/hostels \
  -H "Authorization: Bearer <token>"
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Students (Admin only for write operations)
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Hostels (Admin only for write operations)
- `GET /api/hostels` - List all hostels
- `GET /api/hostels/:id` - Get hostel details
- `POST /api/hostels` - Create hostel
- `PUT /api/hostels/:id` - Update hostel
- `DELETE /api/hostels/:id` - Delete hostel

### Rooms (Admin only for write operations)
- `GET /api/rooms` - List all rooms
- `GET /api/rooms?hostel_id=1` - List rooms by hostel
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Applications
- `GET /api/applications` - List all applications
- `GET /api/applications?student_id=1` - List by student
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create application (students)
- `PUT /api/applications/:id` - Update status (admin only)
- `DELETE /api/applications/:id` - Delete application

### Allotments (Admin only for write operations)
- `GET /api/allotments` - List all allotments
- `GET /api/allotments?student_id=1` - List by student
- `GET /api/allotments/:id` - Get allotment details
- `POST /api/allotments` - Create allotment
- `PUT /api/allotments/:id` - Update allotment
- `DELETE /api/allotments/:id` - Delete allotment

### Payments
- `GET /api/payments` - List all payments
- `GET /api/payments?student_id=1` - List by student
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment (admin only)
- `DELETE /api/payments/:id` - Delete payment (admin only)

### Complaints
- `GET /api/complaints` - List all complaints
- `GET /api/complaints?student_id=1` - List by student
- `GET /api/complaints/:id` - Get complaint details
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update status (admin only)
- `DELETE /api/complaints/:id` - Delete complaint

### Fees (Admin only for write operations)
- `GET /api/fees` - List all fees
- `GET /api/fees?hostel_id=1` - List by hostel
- `GET /api/fees/:id` - Get fee details
- `POST /api/fees` - Create fee
- `PUT /api/fees/:id` - Update fee
- `DELETE /api/fees/:id` - Delete fee

## Troubleshooting

### Database Connection Issues

1. **Error: Access denied**
   - Check your MySQL username and password in `.env`
   - Make sure MySQL server is running

2. **Error: Database doesn't exist**
   - Create the database: `CREATE DATABASE hostel_allotment;`
   - Import the schema: `mysql -u root -p hostel_allotment < schema.sql`

3. **Error: Can't connect to MySQL server**
   - Start MySQL server: `brew services start mysql` or `mysql.server start`

### Port Already in Use

If port 5000 is already in use, change it in `.env`:
```env
PORT=3000  # or any other available port
```

### CORS Issues

If you change the frontend port, update `.env`:
```env
CORS_ORIGIN=http://localhost:YOUR_FRONTEND_PORT
```

## Next Steps

1. ✅ Set up database and import schema
2. ✅ Configure `.env` with database credentials
3. ✅ Start the backend server
4. ✅ Start the frontend development server
5. 🎉 Begin development!

## Features Implemented

- ✅ JWT Authentication
- ✅ Role-based Access Control (Student/Admin)
- ✅ Complete CRUD operations for all entities
- ✅ Advanced queries with JOINs
- ✅ Input validation
- ✅ Error handling
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ Request logging (Morgan)

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [JWT Documentation](https://jwt.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
