const nodemailer = require("nodemailer");


/*
|--------------------------------------------------------------------------
| CREATE SMTP TRANSPORTER
|--------------------------------------------------------------------------
*/

const createTransporter = () => {

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD
  } = process.env;


  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD
  ) {

    console.warn(
      "Email notification is not configured. Add SMTP_* variables to backend/.env."
    );

    return null;

  }


  return nodemailer.createTransport({

    host: SMTP_HOST,

    port: Number(SMTP_PORT),

    secure:
      String(SMTP_PORT) === "465",

    auth: {

      user: SMTP_USER,

      pass: SMTP_PASSWORD

    }

  });

};


/*
|--------------------------------------------------------------------------
| FROM ADDRESS
|--------------------------------------------------------------------------
*/

const getFromAddress = () => {

  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER
  );

};


/*
|--------------------------------------------------------------------------
| SEND TASK ASSIGNMENT EMAIL
|--------------------------------------------------------------------------
*/

const sendTaskAssignedEmail = async ({
  employee,
  task
}) => {

  const transporter =
    createTransporter();


  if (!transporter) {

    return false;

  }


  await transporter.sendMail({

    from:
      getFromAddress(),

    to:
      employee.email,

    subject:
      `New Task Assigned: ${task.title}`,

    text: [

      `Hello ${employee.name},`,

      "",

      "A new task has been assigned to you.",

      "",

      `Task: ${task.title}`,

      `Description: ${task.description}`,

      `Priority: ${task.priority}`,

      `Status: ${task.status}`,

      "",

      "Please log in to the Task Manager to view and update the task."

    ].join("\n"),

    html: `

      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222;
        "
      >

        <h2>
          New Task Assigned
        </h2>

        <p>
          Hello ${employee.name},
        </p>

        <p>
          A new task has been assigned to you.
        </p>

        <table
          style="
            border-collapse: collapse;
            width: 100%;
            max-width: 650px;
          "
        >

          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Task</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.title}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Description</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.description}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Priority</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.priority}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Status</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.status}
            </td>

          </tr>

        </table>


        <p>

          Please log in to the Task Manager
          to view and update the task.

        </p>

      </div>

    `

  });


  return true;

};


/*
|--------------------------------------------------------------------------
| SEND TASK STATUS EMAIL TO ADMINS
|--------------------------------------------------------------------------
*/

const sendTaskStatusUpdatedEmail = async ({
  employee,
  task,
  previousStatus,
  newStatus,
  admins
}) => {

  const transporter =
    createTransporter();


  if (!transporter) {

    return false;

  }


  const recipients =
    admins

      .map(
        admin =>
          admin.email
      )

      .filter(Boolean);


  if (
    recipients.length === 0
  ) {

    console.warn(
      "No admin email address was found for task status notification."
    );

    return false;

  }


  await transporter.sendMail({

    from:
      getFromAddress(),

    to:
      recipients.join(","),

    subject:
      `Task Status Updated: ${task.title}`,

    text: [

      "Hello Admin,",

      "",

      `${employee.name} has updated a task status.`,

      "",

      `Task: ${task.title}`,

      `Employee: ${employee.name} (${employee.email})`,

      `Previous Status: ${previousStatus}`,

      `New Status: ${newStatus}`,

      `Priority: ${task.priority}`,

      ""

    ].join("\n"),

    html: `

      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #222;
        "
      >

        <h2>
          Task Status Updated
        </h2>

        <p>

          <strong>
            ${employee.name}
          </strong>

          has updated a task status.

        </p>


        <table
          style="
            border-collapse: collapse;
            width: 100%;
            max-width: 650px;
          "
        >

          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Task</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.title}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Employee</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${employee.name}
              (${employee.email})
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Previous Status</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${previousStatus}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>New Status</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${newStatus}
            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              <strong>Priority</strong>
            </td>

            <td
              style="
                padding: 8px;
                border: 1px solid #ddd;
              "
            >
              ${task.priority}
            </td>

          </tr>

        </table>

      </div>

    `

  });


  return true;

};


module.exports = {

  sendTaskAssignedEmail,

  sendTaskStatusUpdatedEmail

};