const express = require("express");

const router = express.Router();


const {
  getEmployees,
  createEmployee,
  getTaskStats
} = require(
  "../controllers/adminControllers"
);


const {
  verifyAccessToken,
  requireAdmin
} = require(
  "../middlewares.js"
);


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
|
| Every route requires:
|
| 1. Valid authentication token
| 2. Admin role
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| GET ALL EMPLOYEES
|--------------------------------------------------------------------------
|
| GET /api/admin/employees
|
*/

router.get(
  "/employees",
  verifyAccessToken,
  requireAdmin,
  getEmployees
);


/*
|--------------------------------------------------------------------------
| CREATE EMPLOYEE
|--------------------------------------------------------------------------
|
| POST /api/admin/employees
|
*/

router.post(
  "/employees",
  verifyAccessToken,
  requireAdmin,
  createEmployee
);


/*
|--------------------------------------------------------------------------
| TASK STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/admin/task-stats
|
*/

router.get(
  "/task-stats",
  verifyAccessToken,
  requireAdmin,
  getTaskStats
);


module.exports = router;