const express = require("express");

const router =
  express.Router();


const {

  getAdminTasks,

  createTask,

  updateTask,

  deleteTask,

  getEmployeeTasks,

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
| ADMIN TASK ROUTES
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET ALL TASKS
|--------------------------------------------------------------------------
|
| GET /api/tasks/admin
|
| Search:
|
| /api/tasks/admin?search=login
|
| Pagination:
|
| /api/tasks/admin?page=2&limit=10
|
|--------------------------------------------------------------------------
*/

router.get(

  "/admin",

  verifyAccessToken,

  requireAdmin,

  getAdminTasks

);


/*
|--------------------------------------------------------------------------
| CREATE TASK
|--------------------------------------------------------------------------
|
| POST /api/tasks/admin
|
|--------------------------------------------------------------------------
*/

router.post(

  "/admin",

  verifyAccessToken,

  requireAdmin,

  createTask

);


/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
|
| PUT /api/tasks/admin/:taskId
|
|--------------------------------------------------------------------------
*/

router.put(

  "/admin/:taskId",

  verifyAccessToken,

  requireAdmin,

  updateTask

);


/*
|--------------------------------------------------------------------------
| DELETE TASK
|--------------------------------------------------------------------------
|
| DELETE /api/tasks/admin/:taskId
|
|--------------------------------------------------------------------------
*/

router.delete(

  "/admin/:taskId",

  verifyAccessToken,

  requireAdmin,

  deleteTask

);


/*
|--------------------------------------------------------------------------
| EMPLOYEE TASK ROUTES
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET EMPLOYEE TASKS
|--------------------------------------------------------------------------
|
| GET /api/tasks/employee
|
|--------------------------------------------------------------------------
*/

router.get(

  "/employee",

  verifyAccessToken,

  requireEmployee,

  getEmployeeTasks

);


/*
|--------------------------------------------------------------------------
| UPDATE EMPLOYEE TASK STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/tasks/employee/:taskId/status
|
|--------------------------------------------------------------------------
*/

router.patch(

  "/employee/:taskId/status",

  verifyAccessToken,

  requireEmployee,

  updateTaskStatus

);


module.exports = router;