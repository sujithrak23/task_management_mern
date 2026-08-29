const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");

const {
  validateEmail
} = require("../utils/validation");


/*
|--------------------------------------------------------------------------
| GET ALL EMPLOYEES
|--------------------------------------------------------------------------
*/

exports.getEmployees = async (req, res) => {

  try {

    const employees =
      await User
        .find({
          role: "employee"
        })
        .select("-password")
        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      status: true,

      employees,

      count: employees.length,

      msg: "Employees fetched successfully"

    });

  }

  catch (err) {

    console.error(err);

    return res.status(500).json({

      status: false,

      msg: "Internal Server Error"

    });

  }

};


/*
|--------------------------------------------------------------------------
| CREATE EMPLOYEE
|--------------------------------------------------------------------------
*/

exports.createEmployee = async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Required fields
    |--------------------------------------------------------------------------
    */

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        status: false,

        msg: "Please fill all the fields"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate data types
    |--------------------------------------------------------------------------
    */

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {

      return res.status(400).json({

        status: false,

        msg: "Invalid data"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate email
    |--------------------------------------------------------------------------
    */

    if (!validateEmail(email)) {

      return res.status(400).json({

        status: false,

        msg: "Invalid Email"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate password
    |--------------------------------------------------------------------------
    */

    if (password.length < 4) {

      return res.status(400).json({

        status: false,

        msg: "Password must be at least 4 characters"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Check duplicate email
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await User.findOne({
        email: email
          .trim()
          .toLowerCase()
      });


    if (existingUser) {

      return res.status(400).json({

        status: false,

        msg: "This email is already registered"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    /*
    |--------------------------------------------------------------------------
    | Create employee
    |--------------------------------------------------------------------------
    */

    const employee =
      await User.create({

        name: name.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        password:
          hashedPassword,

        role: "employee"

      });


    const employeeResponse =
      employee.toObject();


    delete employeeResponse.password;


    return res.status(201).json({

      status: true,

      employee: employeeResponse,

      msg: "Employee created successfully"

    });

  }

  catch (err) {

    console.error(err);


    if (err.code === 11000) {

      return res.status(400).json({

        status: false,

        msg: "This email is already registered"

      });

    }


    return res.status(500).json({

      status: false,

      msg: "Internal Server Error"

    });

  }

};


/*
|--------------------------------------------------------------------------
| GET TASK STATISTICS
|--------------------------------------------------------------------------
|
| Admin dashboard statistics:
|
| Total
| Not Started
| Pending
| In Progress
| Completed
|
|--------------------------------------------------------------------------
*/

exports.getTaskStats = async (req, res) => {

  try {

    const [
      total,
      notStarted,
      pending,
      inProgress,
      completed
    ] = await Promise.all([

      Task.countDocuments(),

      Task.countDocuments({
        status: "Not Started"
      }),

      Task.countDocuments({
        status: "Pending"
      }),

      Task.countDocuments({
        status: "In Progress"
      }),

      Task.countDocuments({
        status: "Completed"
      })

    ]);


    return res.status(200).json({

      status: true,

      statistics: {

        total,

        notStarted,

        pending,

        inProgress,

        completed

      },

      msg: "Task statistics fetched successfully"

    });

  }

  catch (err) {

    console.error(err);

    return res.status(500).json({

      status: false,

      msg: "Unable to fetch task statistics"

    });

  }

};