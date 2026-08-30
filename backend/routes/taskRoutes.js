const express = require("express");
const router = express.Router();
const {
  getAdminTasks,
  createTask,
  updateTask,
  deleteTask,
  getEmployeeTasks,
  updateEmployeeTask,
  deleteEmployeeTask,
  updateTaskStatus
} = require(
  "../controllers/taskControllers"
);
const {
  verifyAccessToken,
  requireAdmin,
  requireEmployee
} = require(
  "../middlewares.js"
);
/*
|--------------------------------------------------------------------------
| ADMIN TASKS
|--------------------------------------------------------------------------
*/
/*
| GET /api/tasks/admin
*/
router.get(
  "/admin",
  verifyAccessToken,
  requireAdmin,
  getAdminTasks
);
/*
| POST /api/tasks/admin
*/
router.post(
  "/admin",
  verifyAccessToken,
  requireAdmin,
  createTask
);
/*
| PUT /api/tasks/admin/:taskId
*/
router.put(
  "/admin/:taskId",
  verifyAccessToken,
  requireAdmin,
  updateTask
);
/*
| DELETE /api/tasks/admin/:taskId
*/
router.delete(
  "/admin/:taskId",
  verifyAccessToken,
  requireAdmin,
  deleteTask
);
/*
|--------------------------------------------------------------------------
| EMPLOYEE TASKS
|--------------------------------------------------------------------------
*/
/*
| GET /api/tasks/employee
*/
router.get(
  "/employee",
  verifyAccessToken,
  requireEmployee,
  getEmployeeTasks
);
/*
| PUT /api/tasks/employee/:taskId
|
| Employee edits own task.
*/
router.put(
  "/employee/:taskId",
  verifyAccessToken,
  requireEmployee,
  updateEmployeeTask
);
/*
| DELETE /api/tasks/employee/:taskId
|
| Employee deletes own task.
*/
router.delete(
  "/employee/:taskId",
  verifyAccessToken,
  requireEmployee,
  deleteEmployeeTask
);
/*
| PATCH /api/tasks/employee/:taskId/status
|
| Employee updates status.
*/
router.patch(
  "/employee/:taskId/status",
  verifyAccessToken,
  requireEmployee,
  updateTaskStatus
);
module.exports =
  router;