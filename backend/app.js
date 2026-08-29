const express = require("express");

const app = express();

const mongoose = require("mongoose");

const path = require("path");

const cors = require("cors");

require("dotenv").config();


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const authRoutes =
  require("./routes/authRoutes");

const taskRoutes =
  require("./routes/taskRoutes");

const profileRoutes =
  require("./routes/profileRoutes");

const adminRoutes =
  require("./routes/adminRoutes");


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  express.json()
);

app.use(
  cors()
);


/*
|--------------------------------------------------------------------------
| MongoDB
|--------------------------------------------------------------------------
*/

const mongoUrl =
  process.env.MONGODB_URL;


mongoose.connect(
  mongoUrl,
  err => {

    if (err) {

      console.error(
        "MongoDB connection failed:",
        err
      );

      throw err;

    }

    console.log(
      "Mongodb connected..."
    );

  }
);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/tasks",
  taskRoutes
);


app.use(
  "/api/profile",
  profileRoutes
);


app.use(
  "/api/admin",
  adminRoutes
);


/*
|--------------------------------------------------------------------------
| Production
|--------------------------------------------------------------------------
*/

if (
  process.env.NODE_ENV === "production"
) {

  app.use(
    express.static(
      path.resolve(
        __dirname,
        "../frontend/build"
      )
    )
  );


  app.get(
    "*",
    (req, res) => {

      res.sendFile(
        path.resolve(
          __dirname,
          "../frontend/build/index.html"
        )
      );

    }
  );

}


/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const port =
  process.env.PORT || 5000;


app.listen(
  port,
  () => {

    console.log(
      `Backend is running on port ${port}`
    );

  }
);