# MERN Task Management System

A role-based MERN Task Management System.

## Project Overview

The system has two roles:

### Admin
- Admin login
- View employees
- Create employee accounts
- Create and assign tasks
- Set priority: High / Medium / Low
- View task statistics
- View all assigned tasks
- Search tasks
- Pagination
- Edit and delete tasks
- Receive email notifications when employees change task status

### Employee
- Employee login
- View tasks assigned to the logged-in employee
- Update task status:
  - Not Started
  - Pending
  - In Progress
  - Completed
- Receive email notification when a task is assigned
- Employees do **not** edit or delete tasks from the Employee UI

## Technology Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Mongoose
- JWT authentication
- bcrypt password hashing
- Nodemailer / SMTP
- Axios
- Redux
- React Router
- Tailwind CSS
- React Toastify

## Architecture

```text
Frontend (React)
   |
   | Axios / HTTP
   v
Backend (Node + Express)
   |
   +-- Routes
   +-- Authentication / RBAC middleware
   +-- Controllers
   +-- Validation
   +-- Email utility
   |
   v
MongoDB

Backend Email Utility
   |
   v
Nodemailer
   |
   v
Gmail / SMTP
```

## Authentication and RBAC

The user logs in with email and password. The backend:
1. Finds the user in MongoDB.
2. Compares the password with the bcrypt hash.
3. Creates a JWT after successful authentication.
4. The protected API verifies the JWT.
5. Role middleware restricts Admin and Employee endpoints.

The backend is the security boundary. Frontend route protection is only for navigation/user experience.

## Task Fields

- Title
- Description
- Assigned Employee
- Priority
- Status
- Created Date
- Updated Date

### Status meanings

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| Pending | Work is waiting, blocked or temporarily paused |
| In Progress | Employee is actively working |
| Completed | Work is finished |

## Task Permissions

| Operation | Admin | Employee |
|---|---|---|
| Create/assign task | Yes | No |
| View all tasks | Yes | No |
| View assigned tasks | Yes | Yes, assigned tasks |
| Edit task | Yes | No |
| Delete task | Yes | No |
| Update task status | Yes | Yes, assigned tasks |
| Change assignment | Yes | No |
| Set priority | Yes | No |

The Employee dashboard is intentionally limited to viewing assigned tasks and updating their status. Edit/Delete controls are not exposed to employees.

## Email Notification

### Admin assigns a task

```text
Admin
  |
  | Create/Assign Task
  v
POST /api/tasks/admin
  |
  v
createTask controller
  |
  +--> Save task to MongoDB
  |
  +--> sendTaskAssignedEmail()
            |
            v
       Nodemailer
            |
            v
       SMTP / Gmail
            |
            v
       Employee email
```

The assignment email is sent to the employee email stored in the User record.

### Employee changes task status

```text
Employee
   |
   | Change status
   v
PATCH /api/tasks/employee/:taskId/status
   |
   v
updateTaskStatus controller
   |
   +--> Verify JWT
   +--> Verify task belongs to employee
   +--> Save new status to MongoDB
   |
   +--> Find Admin user email(s)
             |
             v
       sendTaskStatusUpdatedEmail()
             |
             v
          Nodemailer
             |
             v
         SMTP / Gmail
             |
             v
            Admin
```

The technical sender is the SMTP/Gmail account configured in the backend environment. The recipient is the Admin email address stored in the database.

## Email Configuration

Create `backend/.env`:

```env
MONGODB_URL=your-mongodb-url
ACCESS_TOKEN_SECRET=your-jwt-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sending-gmail@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-sending-gmail@gmail.com
```

For Gmail, use a Google App Password rather than the normal Gmail password.

Never commit `.env` or real credentials to GitHub.

## Search and Pagination

The Admin task listing supports search and pagination. Search filters the task listing based on the implemented searchable fields. Pagination returns a manageable page of results rather than loading every task at once.

## Validation and Error Handling

The application validates required fields, email format, password requirements, task priority/status values and other API input. Backend errors are returned to the frontend and displayed as user-facing messages.

## Main API Areas

```text
POST   /api/auth/login
POST   /api/auth/signup

GET    /api/admin/employees
POST   /api/admin/employees

GET    /api/tasks/admin
POST   /api/tasks/admin
PUT    /api/tasks/admin/:taskId
DELETE /api/tasks/admin/:taskId

GET    /api/tasks/employee
PATCH  /api/tasks/employee/:taskId/status
```

The exact endpoint names should match the routes in the final submitted source code.

## Installation

### Prerequisites

- Node.js
- npm
- MongoDB
- Gmail/SMTP account for email testing

### Install

From the project root:

```bash
npm run install-all
```

Or install frontend and backend dependencies separately.

### Configure environment

Create:

```text
backend/.env
```

Add the MongoDB, JWT and SMTP configuration.

### Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## User Guide

### Admin

1. Open the application.
2. Select Admin Login.
3. Log in.
4. Open Employees and create employees if required.
5. Open Tasks.
6. Click Assign Task.
7. Enter task details.
8. Select employee and priority.
9. Assign the task.
10. Verify the employee receives an email.
11. Use search and pagination in the task table.
12. Use Edit/Delete for task management.
13. Monitor dashboard statistics.

### Employee

1. Select Employee Login.
2. Log in with the Task Manager credentials.
3. Open assigned tasks.
4. View task details.
5. Update status as work progresses.
6. Verify the Admin receives the status notification email.




