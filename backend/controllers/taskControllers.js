const Task = require("../models/Task");
const User = require("../models/User");

const {
  validateObjectId
} = require("../utils/validation");

const {
  sendTaskAssignedEmail,
  sendTaskStatusUpdatedEmail
} = require("../utils/email");


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
*/

exports.getAdminTasks = async (
  req,
  res
) => {

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
          employee =>
            employee._id
        );

    }


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


    const total =
      await Task.countDocuments(
        filter
      );


    const tasks =
      await Task.find(
        filter
      )

      .populate(
        "assignedTo",
        "name email"
      )

      .sort({
        createdAt: -1
      })

      .skip(skip)

      .limit(limit);


    return res.status(200).json({

      status: true,

      tasks,

      pagination: {

        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total / limit
          )

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
|
| Admin creates task.
|
| Employee receives email.
|
|--------------------------------------------------------------------------
*/

exports.createTask = async (
  req,
  res
) => {

  try {

    const {
      title,
      description,
      assignedTo,
      priority
    } = req.body;


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


    await task.populate(
      "assignedTo",
      "name email"
    );


    /*
    |--------------------------------------------------------------------------
    | Send assignment email
    |--------------------------------------------------------------------------
    */

    let emailSent = false;


    try {

      emailSent =
        await sendTaskAssignedEmail({

          employee,

          task

        });

    }

    catch (emailError) {

      console.error(
        "Task assignment email error:",
        emailError
      );

    }


    return res.status(201).json({

      status: true,

      task,

      emailSent,

      msg:
        emailSent

          ? "Task assigned successfully and email sent to employee"

          : "Task assigned successfully, but email notification could not be sent"

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
| UPDATE ADMIN TASK
|--------------------------------------------------------------------------
|
| Admin can edit:
|
| title
| description
| employee
| priority
| status
|
| If employee changes, the new employee receives
| an assignment email.
|
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


    let reassignedEmployee =
      null;


    const previousAssignedTo =
      task.assignedTo
        ? String(task.assignedTo)
        : null;


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


      reassignedEmployee =
        employee;

    }


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


    await task.save();


    await task.populate(
      "assignedTo",
      "name email"
    );


    let emailSent = false;


    /*
    |--------------------------------------------------------------------------
    | Notify new employee if task was reassigned
    |--------------------------------------------------------------------------
    */

    if (
      reassignedEmployee &&

      String(
        task.assignedTo?._id ||
        task.assignedTo
      ) !== previousAssignedTo
    ) {

      try {

        emailSent =
          await sendTaskAssignedEmail({

            employee:
              reassignedEmployee,

            task

          });

      }

      catch (emailError) {

        console.error(
          "Task reassignment email error:",
          emailError
        );

      }

    }


    return res.status(200).json({

      status: true,

      task,

      emailSent,

      msg:
        emailSent

          ? "Task updated successfully and assignment email sent"

          : "Task updated successfully"

    });

  }

  catch (err) {

    console.error(
      "Update admin task error:",
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
| DELETE ADMIN TASK
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
      "Delete admin task error:",
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

        createdAt:
          -1

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
| EMPLOYEE EDIT TASK
|--------------------------------------------------------------------------
|
| Employee can edit:
|
| - Title
| - Description
| - Priority
|
| Employee cannot change:
|
| - Assigned employee
| - Status through this endpoint
|
|--------------------------------------------------------------------------
*/

exports.updateEmployeeTask = async (
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
      priority
    } = req.body;


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


    const task =
      await Task.findOne({

        _id:
          taskId,

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


    await task.save();


    return res.status(200).json({

      status: true,

      task,

      msg:
        "Task updated successfully"

    });

  }

  catch (err) {

    console.error(
      "Update employee task error:",
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
| EMPLOYEE DELETE TASK
|--------------------------------------------------------------------------
|
| Employee can delete only their own assigned task.
|
|--------------------------------------------------------------------------
*/

exports.deleteEmployeeTask = async (
  req,
  res
) => {

  try {

    const {
      taskId
    } = req.params;


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


    const task =
      await Task.findOneAndDelete({

        _id:
          taskId,

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


    return res.status(200).json({

      status: true,

      msg:
        "Task deleted successfully"

    });

  }

  catch (err) {

    console.error(
      "Delete employee task error:",
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
| EMPLOYEE UPDATE STATUS
|--------------------------------------------------------------------------
|
| Employee can update status only on their own task.
|
| Admin receives an email.
|
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


    const task =
      await Task.findOne({

        _id:
          taskId,

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


    const previousStatus =
      task.status;


    task.status =
      status;


    await task.save();


    let emailSent = false;


    /*
    |--------------------------------------------------------------------------
    | Notify admins only when status actually changes
    |--------------------------------------------------------------------------
    */

    if (
      previousStatus !== status
    ) {

      try {

        const admins =
          await User.find({

            role:
              "admin"

          })

          .select(
            "name email"
          );


        emailSent =
          await sendTaskStatusUpdatedEmail({

            employee:
              req.user,

            task,

            previousStatus,

            newStatus:
              status,

            admins

          });

      }

      catch (emailError) {

        console.error(
          "Task status email error:",
          emailError
        );

      }

    }


    return res.status(200).json({

      status: true,

      task,

      emailSent,

      msg:

        previousStatus === status

          ? "Task status is already set to this value"

          : emailSent

            ? "Task status updated and admin notified"

            : "Task status updated, but admin email notification could not be sent"

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