const User = require("../models/User");
const bcrypt = require("bcrypt");

const {
  createAccessToken
} = require("../utils/token");

const {
  validateEmail
} = require("../utils/validation");


/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
| Public signup creates an Employee account.
| Admin accounts should be created separately.
|--------------------------------------------------------------------------
*/

exports.signup = async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    // Check required fields

    if (!name || !email || !password) {

      return res.status(400).json({
        msg: "Please fill all the fields"
      });

    }


    // Check data types

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {

      return res.status(400).json({
        msg: "Please send string values only"
      });

    }


    // Password validation

    if (password.length < 4) {

      return res.status(400).json({
        msg: "Password length must be atleast 4 characters"
      });

    }


    // Email validation

    if (!validateEmail(email)) {

      return res.status(400).json({
        msg: "Invalid Email"
      });

    }


    // Check whether email already exists

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {

      return res.status(400).json({
        msg: "This email is already registered"
      });

    }


    // Hash password

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    // Create employee account

    await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "employee"
    });


    return res.status(200).json({
      msg: "Congratulations!! Account has been created for you.."
    });

  }

  catch (err) {

    console.error("SIGNUP ERROR:", err);

    return res.status(500).json({
      msg: err.message || "Internal Server Error"
    });

  }

};


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
| Frontend sends:
|
| email
| password
|
| Backend finds the user and gets the role from MongoDB.
|--------------------------------------------------------------------------
*/

exports.login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // Check required fields

    if (!email || !password) {

      return res.status(400).json({
        status: false,
        msg: "Please enter all details!!"
      });

    }


    // Check data types

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {

      return res.status(400).json({
        status: false,
        msg: "Invalid login details"
      });

    }


    // Validate email

    if (!validateEmail(email)) {

      return res.status(400).json({
        status: false,
        msg: "Invalid Email"
      });

    }


    // Find user

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {

      return res.status(400).json({
        status: false,
        msg: "This email is not registered!!"
      });

    }


    // Check whether password exists

    if (!user.password) {

      return res.status(500).json({
        status: false,
        msg: "User password is missing in database"
      });

    }


    // Check password

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        status: false,
        msg: "Password incorrect!!"
      });

    }


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | Role comes from MongoDB.
    |
    | We do NOT trust the frontend to tell us:
    | "I am admin"
    |--------------------------------------------------------------------------
    */

    if (!user.role) {

      return res.status(500).json({
        status: false,
        msg: "User role is missing in database"
      });

    }


    // Create JWT token

    const token = createAccessToken({

      id: user._id,

      role: user.role

    });


    // Convert mongoose document to normal object

    const userResponse = user.toObject();


    // Never send password to frontend

    delete userResponse.password;


    // Send successful response

    return res.status(200).json({

      token,

      user: userResponse,

      status: true,

      msg: "Login successful.."

    });

  }

  catch (err) {

    console.error("LOGIN ERROR:", err);

    return res.status(500).json({

      status: false,

      msg: err.message || "Internal Server Error"

    });

  }

};