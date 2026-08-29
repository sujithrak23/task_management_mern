import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center max-w-4xl">

          {/* Task Manager Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-400 flex items-center justify-center">
              <i className="fa-solid fa-list-check text-6xl text-emerald-400"></i>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to Task Manager App
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12">
            Manage tasks, assign work and track progress easily.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">

            {/* Admin Login */}
            <Link
              to="/login"
              state={{ loginRole: "admin" }}
              className="
                w-60
                px-8
                py-4
                rounded-lg
                bg-emerald-500
                hover:bg-emerald-600
                text-white
                font-bold
                text-lg
                shadow-lg
                hover:shadow-emerald-500/20
                flex
                items-center
                justify-center
                gap-3
              "
            >
              <i className="fa-solid fa-user-shield"></i>
              Admin Login
            </Link>

            {/* Employee Login */}
            <Link
              to="/login"
              state={{ loginRole: "employee" }}
              className="
                w-60
                px-8
                py-4
                rounded-lg
                bg-transparent
                border-2
                border-slate-500
                hover:border-emerald-400
                hover:bg-slate-900
                text-white
                font-bold
                text-lg
                flex
                items-center
                justify-center
                gap-3
              "
            >
              <i className="fa-solid fa-user"></i>
              Employee Login
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;