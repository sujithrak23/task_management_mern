const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema(
  {

    /*
    |--------------------------------------------------------------------------
    | Task Title
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 150
    },


    /*
    |--------------------------------------------------------------------------
    | Task Description
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: 2000
    },


    /*
    |--------------------------------------------------------------------------
    | Assigned Employee
    |--------------------------------------------------------------------------
    */

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    priority: {
      type: String,
      enum: [
        "High",
        "Medium",
        "Low"
      ],
      default: "Medium",
      required: true
    },


    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "Not Started",
        "Pending",
        "In Progress",
        "Completed"
      ],
      default: "Not Started",
      required: true
    }

  },
  {
    timestamps: true
  }
);


const Task =
  mongoose.model("Task", taskSchema);


module.exports = Task;