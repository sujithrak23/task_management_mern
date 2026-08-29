# MERN Task Management System

A role-based MERN Task Management System.

## 1. Project Overview

The application provides separate Admin and Employee workflows.

### Admin
- Admin login
- View employees
- Create employee accounts
- Create and assign tasks
- Set task priority: High, Medium, Low
- View all assigned tasks
- Search tasks by title, description, or employee
- Pagination
- View task statistics
- Edit tasks
- Delete tasks
- Receive email notifications when an employee changes a task status

### Employee
- Employee login
- View assigned tasks
- Update task status:
  - Not Started
  - Pending
  - In Progress
  - Completed
- Edit their own task title, description, and priority
- Delete their own task
- Receive an email when a task is assigned to them

## 2. Technology Stack

### Frontend
- React
- React Router
- Redux
- Axios
- Tailwind CSS
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Nodemailer for email notifications
- dotenv for environment variables

## 3. Architecture

```text
MERN-task-manager/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares.js/
│   ├── utils/
│   ├── app.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── employee/
│   │   ├── redux/
│   │   └── validations/
│   └── package.json
│
└── README.md
```

## 4. Authentication and RBAC

The login form sends only the user's email and password.

The backend:
1. Finds the user in MongoDB.
2. Verifies the password using bcrypt.
3. Reads the user's role from MongoDB.
4. Creates a JWT containing the user ID and role.
5. Returns the token and user information without the password.

Protected backend routes use:
- `verifyAccessToken`
- `requireAdmin`
- `requireEmployee`

The server therefore does not trust a role supplied by the frontend.

## 5. Task Lifecycle

A task has:
- Title
- Description
- Assigned Employee
- Priority
- Status
- Created Date
- Updated Date

Status meanings:

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| Pending | Work is waiting or temporarily blocked |
| In Progress | Employee is actively working |
| Completed | Work is finished |

## 6. Email Notification Implementation

Email functionality is implemented in the backend using Nodemailer.

### A. Admin assigns a task

```text
Admin UI
   ↓
POST /api/tasks/admin
   ↓
createTask controller
   ↓
Task saved in MongoDB
   ↓
sendTaskAssignedEmail()
   ↓
SMTP/Gmail
   ↓
Employee receives email
```

The assignment email contains the task title, description, priority and initial status.

### B. Employee changes task status

```text
Employee UI
   ↓
PATCH /api/tasks/employee/:taskId/status
   ↓
updateTaskStatus controller
   ↓
Task status saved in MongoDB
   ↓
Find admin users
   ↓
sendTaskStatusUpdatedEmail()
   ↓
SMTP/Gmail
   ↓
Admin receives email
```

The status email contains the employee, task, previous status, new status and priority.

### Email configuration

Create `backend/.env` and configure:

```env
MONGODB_URL=your-mongodb-url
ACCESS_TOKEN_SECRET=your-access-token-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sending-gmail@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-sending-gmail@gmail.com
```

For Gmail, use a Google App Password rather than the normal Gmail password.

Never commit `.env` or real credentials to GitHub.

## 7. Installation

### Prerequisites
- Node.js
- npm
- MongoDB database
- Gmail/SMTP account if email testing is required

### Install everything

From the project root:

```bash
npm run install-all
```

Or install separately:

```bash
npm install
cd frontend
npm install
cd ../backend
npm install
```

### Environment variables

Create:

```text
backend/.env
```

Add MongoDB, JWT and SMTP values.

### Start development

From the project root:

```bash
npm run dev
```

This starts the backend and frontend together.

Alternatively:

```bash
npm run dev-server
```

and in another terminal:

```bash
npm run dev-client
```

The frontend normally runs at:

```text
http://localhost:3000
```

The backend normally runs at:

```text
http://localhost:5000
```

## 8. User Guide

### Admin workflow

1. Open the application.
2. Choose **Admin Login**.
3. Enter admin credentials.
4. Open the Admin dashboard.
5. Create employees if required.
6. Open Task Management.
7. Click **Assign Task**.
8. Enter title and description.
9. Select an employee.
10. Select priority.
11. Assign the task.
12. The employee receives an email if SMTP is configured.
13. Use search and pagination to manage tasks.
14. Click Edit to modify a task.
15. Click Delete to remove a task.
16. Monitor task statistics on the dashboard.

### Employee workflow

1. Choose **Employee Login**.
2. Enter employee credentials.
3. Open My Tasks.
4. View assigned tasks.
5. Change the status when work progresses.
6. The Admin receives an email when the status changes.
7. Use Edit to update the employee's own task title, description or priority.
8. Use Delete to remove the employee's own task.

## 9. API Overview

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Admin

```text
GET    /api/admin/employees
POST   /api/admin/employees

GET    /api/tasks/admin
POST   /api/tasks/admin
PUT    /api/tasks/admin/:taskId
DELETE /api/tasks/admin/:taskId
```

### Employee

```text
GET    /api/tasks/employee
PUT    /api/tasks/employee/:taskId
DELETE /api/tasks/employee/:taskId
PATCH  /api/tasks/employee/:taskId/status
```

