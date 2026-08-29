const Task = require("../models/Task");
const User = require("../models/User");

const {
  validateObjectId
} = require("../utils/validation");


/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const VALID_PRIORITIES = [
  "High",
  "Medium",
  "Low"
];


const VALID_STATUSES = [
  "Not Started",
  "Pending",
  "In Progress",
  "Completed"
];


/*
|--------------------------------------------------------------------------
| GET ADMIN TASKS
|--------------------------------------------------------------------------
| GET /api/tasks/admin
|
| Admin can:
| - View all tasks
| - Search tasks
| - Search employee name/email
| - Paginate tasks
|--------------------------------------------------------------------------
*/

exports.getAdminTasks = async (req, res) => {

  try {

    const page =
      Math.max(
        Number(req.query.page) || 1,
        1
      );


    const limit =
      Math.min(
        Math.max(
          Number(req.query.limit) || 10,
          1
        ),
        50
      );


    const search =
      String(
        req.query.search || ""
      ).trim();


    const skip =
      (page - 1) * limit;


    /*
    |--------------------------------------------------------------------------
    | Search employees
    |--------------------------------------------------------------------------
    */

    let employeeIds = [];


    if (search) {

      const employees =
        await User.find(
          {
            role: "employee",

            $or: [

              {
                name: {
                  $regex: search,
                  $options: "i"
                }
              },

              {
                email: {
                  $regex: search,
                  $options: "i"
                }
              }

            ]
          },
          "_id"
        );


      employeeIds =
        employees.map(
          employee => employee._id
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Build task filter
    |--------------------------------------------------------------------------
    */

    const filter = {};


    if (search) {

      filter.$or = [

        {
          title: {
            $regex: search,
            $options: "i"
          }
        },

        {
          description: {
            $regex: search,
            $options: "i"
          }
        },

        {
          assignedTo: {
            $in: employeeIds
          }
        }

      ];

    }


    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const total =
      await Task.countDocuments(
        filter
      );


    /*
    |--------------------------------------------------------------------------
    | Get tasks
    |--------------------------------------------------------------------------
    */

    const tasks =
      await Task.find(filter)

        .populate(
          "assignedTo",
          "name email"
        )

        .sort({
          createdAt: -1
        })

        .skip(skip)

        .limit(limit);


    const totalPages =
      Math.ceil(
        total / limit
      );


    return res.status(200).json({

      status: true,

      tasks,

      pagination: {

        page,

        limit,

        total,

        totalPages

      },

      msg:
        "Tasks fetched successfully"

    });

  }

  catch (err) {

    console.error(
      "Get admin tasks error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to fetch tasks"

    });

  }

};


/*
|--------------------------------------------------------------------------
| CREATE TASK
|--------------------------------------------------------------------------
| POST /api/tasks/admin
|
| Admin creates and assigns a task.
|--------------------------------------------------------------------------
*/

exports.createTask = async (req, res) => {

  try {

    const {
      title,
      description,
      assignedTo,
      priority
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Required fields
    |--------------------------------------------------------------------------
    */

    if (
      !title ||
      !description ||
      !assignedTo ||
      !priority
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Please fill all the fields"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate text
    |--------------------------------------------------------------------------
    */

    if (
      typeof title !== "string" ||
      typeof description !== "string"
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid task data"

      });

    }


    if (
      !title.trim() ||
      !description.trim()
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Task title and description cannot be empty"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate employee ID
    |--------------------------------------------------------------------------
    */

    if (
      !validateObjectId(
        assignedTo
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid employee ID"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate priority
    |--------------------------------------------------------------------------
    */

    if (
      !VALID_PRIORITIES.includes(
        priority
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid priority"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Verify employee
    |--------------------------------------------------------------------------
    */

    const employee =
      await User.findOne({

        _id: assignedTo,

        role: "employee"

      });


    if (!employee) {

      return res.status(400).json({

        status: false,

        msg:
          "Employee not found"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Create task
    |--------------------------------------------------------------------------
    */

    const task =
      await Task.create({

        title:
          title.trim(),

        description:
          description.trim(),

        assignedTo:
          employee._id,

        priority,

        status:
          "Not Started"

      });


    /*
    |--------------------------------------------------------------------------
    | Populate employee
    |--------------------------------------------------------------------------
    */

    await task.populate(
      "assignedTo",
      "name email"
    );


    return res.status(201).json({

      status: true,

      task,

      msg:
        "Task assigned successfully"

    });

  }

  catch (err) {

    console.error(
      "Create task error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to create task"

    });

  }

};


/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
| PUT /api/tasks/admin/:taskId
|
| Admin can edit:
| - Title
| - Description
| - Employee
| - Priority
| - Status
|--------------------------------------------------------------------------
*/

exports.updateTask = async (
  req,
  res
) => {

  try {

    const {
      taskId
    } = req.params;


    const {
      title,
      description,
      assignedTo,
      priority,
      status
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate task ID
    |--------------------------------------------------------------------------
    */

    if (
      !validateObjectId(
        taskId
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid task ID"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find task
    |--------------------------------------------------------------------------
    */

    const task =
      await Task.findById(
        taskId
      );


    if (!task) {

      return res.status(404).json({

        status: false,

        msg:
          "Task not found"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate title
    |--------------------------------------------------------------------------
    */

    if (
      title !== undefined
    ) {

      if (
        typeof title !== "string" ||
        !title.trim()
      ) {

        return res.status(400).json({

          status: false,

          msg:
            "Task title cannot be empty"

        });

      }


      task.title =
        title.trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Validate description
    |--------------------------------------------------------------------------
    */

    if (
      description !== undefined
    ) {

      if (
        typeof description !== "string" ||
        !description.trim()
      ) {

        return res.status(400).json({

          status: false,

          msg:
            "Task description cannot be empty"

        });

      }


      task.description =
        description.trim();

    }


    /*
    |--------------------------------------------------------------------------
    | Validate assigned employee
    |--------------------------------------------------------------------------
    */

    if (
      assignedTo !== undefined
    ) {

      if (
        !validateObjectId(
          assignedTo
        )
      ) {

        return res.status(400).json({

          status: false,

          msg:
            "Invalid employee ID"

        });

      }


      const employee =
        await User.findOne({

          _id: assignedTo,

          role: "employee"

        });


      if (!employee) {

        return res.status(400).json({

          status: false,

          msg:
            "Employee not found"

        });

      }


      task.assignedTo =
        employee._id;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate priority
    |--------------------------------------------------------------------------
    */

    if (
      priority !== undefined
    ) {

      if (
        !VALID_PRIORITIES.includes(
          priority
        )
      ) {

        return res.status(400).json({

          status: false,

          msg:
            "Invalid priority"

        });

      }


      task.priority =
        priority;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    if (
      status !== undefined
    ) {

      if (
        !VALID_STATUSES.includes(
          status
        )
      ) {

        return res.status(400).json({

          status: false,

          msg:
            "Invalid task status"

        });

      }


      task.status =
        status;

    }


    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await task.save();


    /*
    |--------------------------------------------------------------------------
    | Populate employee
    |--------------------------------------------------------------------------
    */

    await task.populate(
      "assignedTo",
      "name email"
    );


    return res.status(200).json({

      status: true,

      task,

      msg:
        "Task updated successfully"

    });

  }

  catch (err) {

    console.error(
      "Update task error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to update task"

    });

  }

};


/*
|--------------------------------------------------------------------------
| DELETE TASK
|--------------------------------------------------------------------------
| DELETE /api/tasks/admin/:taskId
|
| Admin can permanently delete a task.
|--------------------------------------------------------------------------
*/

exports.deleteTask = async (
  req,
  res
) => {

  try {

    const {
      taskId
    } = req.params;


    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (
      !validateObjectId(
        taskId
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid task ID"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Delete task
    |--------------------------------------------------------------------------
    */

    const task =
      await Task.findByIdAndDelete(
        taskId
      );


    if (!task) {

      return res.status(404).json({

        status: false,

        msg:
          "Task not found"

      });

    }


    return res.status(200).json({

      status: true,

      msg:
        "Task deleted successfully"

    });

  }

  catch (err) {

    console.error(
      "Delete task error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to delete task"

    });

  }

};


/*
|--------------------------------------------------------------------------
| GET EMPLOYEE TASKS
|--------------------------------------------------------------------------
| GET /api/tasks/employee
|--------------------------------------------------------------------------
*/

exports.getEmployeeTasks = async (
  req,
  res
) => {

  try {

    const tasks =
      await Task.find({

        assignedTo:
          req.user._id

      })

      .sort({

        createdAt: -1

      });


    return res.status(200).json({

      status: true,

      tasks,

      msg:
        "Tasks fetched successfully"

    });

  }

  catch (err) {

    console.error(
      "Get employee tasks error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to fetch tasks"

    });

  }

};


/*
|--------------------------------------------------------------------------
| UPDATE EMPLOYEE TASK STATUS
|--------------------------------------------------------------------------
| PATCH /api/tasks/employee/:taskId/status
|
| Employee can ONLY update status of their own task.
|--------------------------------------------------------------------------
*/

exports.updateTaskStatus = async (
  req,
  res
) => {

  try {

    const {
      taskId
    } = req.params;


    const {
      status
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | Validate task ID
    |--------------------------------------------------------------------------
    */

    if (
      !validateObjectId(
        taskId
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid task ID"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    if (
      !VALID_STATUSES.includes(
        status
      )
    ) {

      return res.status(400).json({

        status: false,

        msg:
          "Invalid task status"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Find employee's own task
    |--------------------------------------------------------------------------
    */

    const task =
      await Task.findOne({

        _id: taskId,

        assignedTo:
          req.user._id

      });


    if (!task) {

      return res.status(404).json({

        status: false,

        msg:
          "Task not found"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | Update status
    |--------------------------------------------------------------------------
    */

    task.status =
      status;


    await task.save();


    return res.status(200).json({

      status: true,

      task,

      msg:
        "Task status updated successfully"

    });

  }

  catch (err) {

    console.error(
      "Update employee task status error:",
      err
    );


    return res.status(500).json({

      status: false,

      msg:
        "Unable to update task status"

    });

  }

};