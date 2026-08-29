import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    user = null;
  }

  /*
   * Get role from whichever place the application has stored it.
   * This makes the navbar work with the existing login implementation.
   */
  const storedRole = localStorage.getItem("role");

  let role = storedRole || user?.role || "";

  /*
   * Fallback:
   * If role is not stored but the current URL is an admin/employee
   * page, determine the role from the current route.
   */
  if (!role) {
    if (location.pathname.startsWith("/admin")) {
      role = "admin";
    } else if (location.pathname.startsWith("/employee")) {
      role = "employee";
    }
  }

  const isAdmin = role.toLowerCase() === "admin";
  const isEmployee =
    role.toLowerCase() === "employee" ||
    role.toLowerCase() === "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
  };

  // Do not show navbar on the public home page.
  if (!token && location.pathname === "/") {
    return null;
  }

  // If there is no logged-in user, don't show the authenticated navbar.
  if (!token) {
    return null;
  }

  const linkClass = (path) => {
    const active = location.pathname === path;

    return `
      px-4 py-2
      rounded-lg
      font-semibold
      text-sm
      transition-all
      duration-200
      ${
        active
          ? "bg-emerald-500 text-white"
          : "text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
      }
    `;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to={
              isAdmin
                ? "/admin/dashboard"
                : isEmployee
                ? "/employee/dashboard"
                : "/"
            }
            className="text-xl font-bold tracking-wide text-emerald-400 hover:text-emerald-300"
          >
            TASK MANAGER
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">

            {/* ADMIN NAVIGATION */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={linkClass("/admin/dashboard")}
                >
                  <i className="fa-solid fa-chart-line mr-2"></i>
                  DASHBOARD
                </Link>

                <Link
                  to="/admin/employees"
                  className={linkClass("/admin/employees")}
                >
                  <i className="fa-solid fa-users mr-2"></i>
                  EMPLOYEES
                </Link>

                <Link
                  to="/admin/tasks"
                  className={linkClass("/admin/tasks")}
                >
                  <i className="fa-solid fa-list-check mr-2"></i>
                  TASKS
                </Link>
              </>
            )}

            {/* EMPLOYEE NAVIGATION */}
            {isEmployee && (
              <>
                <Link
                  to="/employee/dashboard"
                  className={linkClass("/employee/dashboard")}
                >
                  <i className="fa-solid fa-chart-line mr-2"></i>
                  DASHBOARD
                </Link>

                <Link
                  to="/employee/tasks"
                  className={linkClass("/employee/tasks")}
                >
                  <i className="fa-solid fa-list-check mr-2"></i>
                  MY TASKS
                </Link>
              </>
            )}

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                ml-3
                px-4
                py-2
                rounded-lg
                font-semibold
                text-red-400
                hover:bg-red-600
                hover:text-white
                transition-all
                duration-200
              "
            >
              <i className="fa-solid fa-right-from-bracket mr-2"></i>
              Logout
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;