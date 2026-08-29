const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
  ACCESS_TOKEN_SECRET
} = process.env;


/*
|--------------------------------------------------------------------------
| Verify Access Token
|--------------------------------------------------------------------------
*/

exports.verifyAccessToken = async (req, res, next) => {

  const token = req.header("Authorization");


  if (!token) {

    return res.status(401).json({
      status: false,
      msg: "Token not found"
    });

  }


  let decodedUser;

  try {

    decodedUser = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    );

  } catch (err) {

    return res.status(401).json({
      status: false,
      msg: "Invalid token"
    });

  }


  try {

    const user = await User.findById(
      decodedUser.id
    );


    if (!user) {

      return res.status(401).json({
        status: false,
        msg: "User not found"
      });

    }


    req.user = user;

    next();

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      status: false,
      msg: "Internal Server Error"
    });

  }

};


/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
*/

exports.requireAdmin = (req, res, next) => {

  if (!req.user) {

    return res.status(401).json({
      status: false,
      msg: "Authentication required"
    });

  }


  if (req.user.role !== "admin") {

    return res.status(403).json({
      status: false,
      msg: "Admin access required"
    });

  }


  next();

};


/*
|--------------------------------------------------------------------------
| Employee Only
|--------------------------------------------------------------------------
*/

exports.requireEmployee = (req, res, next) => {

  if (!req.user) {

    return res.status(401).json({
      status: false,
      msg: "Authentication required"
    });

  }


  if (req.user.role !== "employee") {

    return res.status(403).json({
      status: false,
      msg: "Employee access required"
    });

  }


  next();

};