import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes
} from "react-router-dom";


/*
|--------------------------------------------------------------------------
| Layout
|--------------------------------------------------------------------------
*/

import MainLayout from "./layouts/MainLayout";


/*
|--------------------------------------------------------------------------
| Pages
|--------------------------------------------------------------------------
*/

import Home from "./pages/Home";

import Login from "./pages/Login";

import Signup from "./pages/Signup";

import NotFound from "./pages/NotFound";


/*
|--------------------------------------------------------------------------
| Admin Pages
|--------------------------------------------------------------------------
*/

import Employees from "./pages/admin/Employees";

import AdminTasks from "./pages/admin/Tasks";


/*
|--------------------------------------------------------------------------
| Employee Pages
|--------------------------------------------------------------------------
*/

import EmployeeTasks from "./pages/employee/Tasks";


/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

import api from "./api";


/*
|--------------------------------------------------------------------------
| Redux
|--------------------------------------------------------------------------
*/

import {
  saveProfile
} from "./redux/actions/authActions";


/*
|--------------------------------------------------------------------------
| ADMIN ROUTE
|--------------------------------------------------------------------------
*/

const AdminRoute = ({
  children
}) => {

  const authState =
    useSelector(
      state => state.authReducer
    );


  if (
    !authState.isLoggedIn
  ) {

    return (

      <Navigate
        to="/login"
        state={{
          loginRole: "admin"
        }}
        replace
      />

    );

  }


  if (
    authState.user?.role !== "admin"
  ) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  return children;

};


/*
|--------------------------------------------------------------------------
| EMPLOYEE ROUTE
|--------------------------------------------------------------------------
*/

const EmployeeRoute = ({
  children
}) => {

  const authState =
    useSelector(
      state => state.authReducer
    );


  if (
    !authState.isLoggedIn
  ) {

    return (

      <Navigate
        to="/login"
        state={{
          loginRole: "employee"
        }}
        replace
      />

    );

  }


  if (
    authState.user?.role !== "employee"
  ) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  return children;

};


/*
|--------------------------------------------------------------------------
| PROTECTED LAYOUT
|--------------------------------------------------------------------------
*/

const ProtectedLayout = ({
  children
}) => {

  return (

    <MainLayout>

      {children}

    </MainLayout>

  );

};


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

const AdminDashboard = () => {

  const authState =
    useSelector(
      state => state.authReducer
    );


  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const [
    statistics,
    setStatistics
  ] = useState({

    total: 0,

    notStarted: 0,

    pending: 0,

    inProgress: 0,

    completed: 0

  });


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | Fetch statistics
  |--------------------------------------------------------------------------
  */

  const fetchStatistics =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const { data } =
            await api.get(
              "/admin/task-stats",
              {
                headers: {

                  Authorization:
                    authState.token

                }
              }
            );


          setStatistics(
            data.statistics
          );

        }

        catch (err) {

          console.error(err);

          setError(
            err.response?.data?.msg ||
            "Unable to load dashboard statistics"
          );

        }

        finally {

          setLoading(false);

        }

      },
      [
        authState.token
      ]
    );


  useEffect(() => {

    fetchStatistics();

  }, [
    fetchStatistics
  ]);


  /*
  |--------------------------------------------------------------------------
  | Statistic Card
  |--------------------------------------------------------------------------
  */

  const StatisticCard = ({
    title,
    value,
    icon
  }) => {

    return (

      <div className="bg-white border rounded-lg shadow-sm p-6">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">

              {title}

            </p>

            <p className="text-3xl font-bold mt-2">

              {loading
                ? "..."
                : value
              }

            </p>

          </div>


          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">

            <i
              className={`${icon} text-xl text-primary`}
            ></i>

          </div>

        </div>

      </div>

    );

  };


  return (

    <div className="p-4 md:p-8">

      <div className="max-w-7xl mx-auto">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">

          <h1 className="text-2xl md:text-3xl font-bold">

            Admin Dashboard

          </h1>

          <p className="mt-2 text-gray-500">

            Monitor tasks and manage your team.

          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mb-6 bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-exclamation mr-2"></i>

            {error}

          </div>

        )}


        {/* ==================================================
            TASK STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">


          <StatisticCard
            title="Total Tasks"
            value={
              statistics.total
            }
            icon="fa-solid fa-list-check"
          />


          <StatisticCard
            title="Not Started"
            value={
              statistics.notStarted
            }
            icon="fa-solid fa-circle"
          />


          <StatisticCard
            title="Pending"
            value={
              statistics.pending
            }
            icon="fa-solid fa-clock"
          />


          <StatisticCard
            title="In Progress"
            value={
              statistics.inProgress
            }
            icon="fa-solid fa-spinner"
          />


          <StatisticCard
            title="Completed"
            value={
              statistics.completed
            }
            icon="fa-solid fa-circle-check"
          />

        </div>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-8">

          <h2 className="text-xl font-semibold mb-4">

            Quick Actions

          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


            {/* Employees */}

            <Link
              to="/admin/employees"
              className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary transition"
            >

              <div className="text-primary">

                <i className="fa-solid fa-users text-4xl"></i>

              </div>


              <h3 className="text-xl font-semibold mt-5">

                Employees

              </h3>


              <p className="text-gray-500 mt-2">

                View and create employees.

              </p>


              <div className="mt-5 text-primary font-medium">

                Manage Employees

                <i className="fa-solid fa-arrow-right ml-2"></i>

              </div>

            </Link>


            {/* Tasks */}

            <Link
              to="/admin/tasks"
              className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md hover:border-primary transition"
            >

              <div className="text-primary">

                <i className="fa-solid fa-list-check text-4xl"></i>

              </div>


              <h3 className="text-xl font-semibold mt-5">

                Tasks

              </h3>


              <p className="text-gray-500 mt-2">

                Assign, edit, delete and monitor tasks.

              </p>


              <div className="mt-5 text-primary font-medium">

                Manage Tasks

                <i className="fa-solid fa-arrow-right ml-2"></i>

              </div>

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

};


/*
|--------------------------------------------------------------------------
| EMPLOYEE DASHBOARD
|--------------------------------------------------------------------------
*/

const EmployeeDashboard = () => {

  return (

    <div className="p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold">

          Employee Dashboard

        </h1>


        <p className="mt-2 text-gray-500">

          View your assigned tasks and update their status.

        </p>


        <Link
          to="/employee/tasks"
          className="inline-block mt-6 bg-primary text-white px-5 py-3 rounded-md hover:opacity-90"
        >

          <i className="fa-solid fa-list-check mr-2"></i>

          View My Tasks

        </Link>

      </div>

    </div>

  );

};


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

function App() {

  const authState =
    useSelector(
      state => state.authReducer
    );


  const dispatch =
    useDispatch();


  /*
  |--------------------------------------------------------------------------
  | Restore authentication
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );


    if (!token) {

      return;

    }


    dispatch(
      saveProfile(token)
    );

  }, [
    dispatch
  ]);


  return (

    <BrowserRouter>

      <Routes>


        {/* ==================================================
            HOME
            NO NAVBAR
        ================================================== */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* ==================================================
            SIGNUP
        ================================================== */}

        <Route
          path="/signup"
          element={

            authState.isLoggedIn

              ? (

                <Navigate
                  to="/"
                  replace
                />

              )

              : (

                <Signup />

              )

          }
        />


        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admin/dashboard"
          element={

            <AdminRoute>

              <ProtectedLayout>

                <AdminDashboard />

              </ProtectedLayout>

            </AdminRoute>

          }
        />


        {/* ==================================================
            ADMIN EMPLOYEES
        ================================================== */}

        <Route
          path="/admin/employees"
          element={

            <AdminRoute>

              <ProtectedLayout>

                <Employees />

              </ProtectedLayout>

            </AdminRoute>

          }
        />


        {/* ==================================================
            ADMIN TASKS
        ================================================== */}

        <Route
          path="/admin/tasks"
          element={

            <AdminRoute>

              <ProtectedLayout>

                <AdminTasks />

              </ProtectedLayout>

            </AdminRoute>

          }
        />


        {/* ==================================================
            EMPLOYEE DASHBOARD
        ================================================== */}

        <Route
          path="/employee/dashboard"
          element={

            <EmployeeRoute>

              <ProtectedLayout>

                <EmployeeDashboard />

              </ProtectedLayout>

            </EmployeeRoute>

          }
        />


        {/* ==================================================
            EMPLOYEE TASKS
        ================================================== */}

        <Route
          path="/employee/tasks"
          element={

            <EmployeeRoute>

              <ProtectedLayout>

                <EmployeeTasks />

              </ProtectedLayout>

            </EmployeeRoute>

          }
        />


        {/* ==================================================
            404
        ================================================== */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;