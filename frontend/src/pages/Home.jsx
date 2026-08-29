import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {

  useEffect(() => {
    document.title = "Task Manager";
  }, []);

  return (

    <div className="min-h-screen bg-primary text-white flex items-center justify-center px-4">

      <div className="text-center max-w-3xl">

        {/* Icon */}

        <div className="mb-6">

          <i className="fa-solid fa-list-check text-6xl"></i>

        </div>


        {/* Heading */}

        <h1 className="text-3xl md:text-5xl font-bold">

          Welcome to Task Manager App

        </h1>


        <p className="mt-5 text-lg md:text-xl text-white/90">

          Manage tasks, assign work and track progress easily.

        </p>


        {/* Login Buttons */}

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">


          {/* Admin */}

          <Link
            to="/login"
            state={{
              loginRole: "admin"
            }}
            className="bg-white text-primary px-8 py-4 rounded-md font-semibold text-lg shadow-md hover:bg-gray-100 transition"
          >

            <i className="fa-solid fa-user-shield mr-2"></i>

            Admin Login

          </Link>


          {/* Employee */}

          <Link
            to="/login"
            state={{
              loginRole: "employee"
            }}
            className="border-2 border-white text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-white hover:text-primary transition"
          >

            <i className="fa-solid fa-user mr-2"></i>

            Employee Login

          </Link>

        </div>

      </div>

    </div>

  );

};

export default Home;