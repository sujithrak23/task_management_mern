import React, {
  useEffect,
  useState
} from "react";

import {
  useSelector
} from "react-redux";

import api from "../../api";


const Employees = () => {


  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  const authState = useSelector(
    state => state.authReducer
  );


  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [showForm, setShowForm] =
    useState(false);


  const [formData, setFormData] =
    useState({

      name: "",

      email: "",

      password: ""

    });


  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Fetch employees
  |--------------------------------------------------------------------------
  */

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      setError("");


      const { data } =
        await api.get(
          "/admin/employees",
          {
            headers: {
              Authorization:
                authState.token
            }
          }
        );


      setEmployees(
        data.employees || []
      );

    }

    catch (err) {

      console.error(err);


      setError(
        err.response?.data?.msg ||
        "Unable to load employees"
      );

    }

    finally {

      setLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Load employees
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      authState.isLoggedIn &&
      authState.user?.role === "admin"
    ) {

      fetchEmployees();

    }

  }, [
    authState.isLoggedIn,
    authState.user?.role,
    authState.token
  ]);


  /*
  |--------------------------------------------------------------------------
  | Handle form change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };


  /*
  |--------------------------------------------------------------------------
  | Create employee
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {

    e.preventDefault();


    setFormError("");


    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {

      setFormError(
        "Please fill all the fields"
      );

      return;

    }


    if (formData.password.length < 4) {

      setFormError(
        "Password must be at least 4 characters"
      );

      return;

    }


    try {

      setFormLoading(true);


      const { data } =
        await api.post(
          "/admin/employees",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password
          },
          {
            headers: {
              Authorization:
                authState.token
            }
          }
        );


      /*
      |--------------------------------------------------------------------------
      | Add newly created employee to list
      |--------------------------------------------------------------------------
      */

      setEmployees(
        [
          data.employee,
          ...employees
        ]
      );


      /*
      |--------------------------------------------------------------------------
      | Reset form
      |--------------------------------------------------------------------------
      */

      setFormData({

        name: "",

        email: "",

        password: ""

      });


      setShowForm(false);

    }

    catch (err) {

      console.error(err);


      setFormError(
        err.response?.data?.msg ||
        "Unable to create employee"
      );

    }

    finally {

      setFormLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="p-8">

        <div className="max-w-6xl mx-auto">

          <p className="text-gray-500">
            Loading employees...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="p-4 md:p-8">

      <div className="max-w-6xl mx-auto">


        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-2xl md:text-3xl font-bold">

              Employees

            </h1>

            <p className="text-gray-500 mt-1">

              Manage employees in your organization

            </p>

          </div>


          <button
            onClick={() => {

              setShowForm(
                !showForm
              );

              setFormError("");

            }}
            className="bg-primary text-white px-5 py-3 rounded-md hover:opacity-90 transition"
          >

            <i
              className={`fa-solid ${
                showForm
                  ? "fa-xmark"
                  : "fa-plus"
              } mr-2`}
            ></i>

            {
              showForm
                ? "Cancel"
                : "Add Employee"
            }

          </button>

        </div>


        {/* --------------------------------------------------
            Add Employee Form
        -------------------------------------------------- */}

        {showForm && (

          <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">

            <h2 className="text-xl font-semibold mb-5">

              Add New Employee

            </h2>


            {formError && (

              <div className="mb-4 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded">

                <i className="fa-solid fa-circle-exclamation mr-2"></i>

                {formError}

              </div>

            )}


            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >

              {/* Name */}

              <div>

                <label
                  htmlFor="name"
                  className="block mb-2 font-medium"
                >
                  Name
                </label>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Employee name"
                  className="w-full border rounded-md px-4 py-3 outline-none focus:border-primary"
                />

              </div>


              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="block mb-2 font-medium"
                >
                  Email
                </label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  className="w-full border rounded-md px-4 py-3 outline-none focus:border-primary"
                />

              </div>


              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="block mb-2 font-medium"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 4 characters"
                  className="w-full border rounded-md px-4 py-3 outline-none focus:border-primary"
                />

              </div>


              {/* Submit */}

              <div className="md:col-span-3">

                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary text-white px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-50"
                >

                  {formLoading
                    ? "Creating..."
                    : "Create Employee"
                  }

                </button>

              </div>

            </form>

          </div>

        )}


        {/* --------------------------------------------------
            Error
        -------------------------------------------------- */}

        {error && (

          <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-md mb-6">

            <i className="fa-solid fa-circle-exclamation mr-2"></i>

            {error}

          </div>

        )}


        {/* --------------------------------------------------
            Employee count
        -------------------------------------------------- */}

        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">

              <i className="fa-solid fa-users text-blue-600"></i>

            </div>

            <div>

              <p className="text-gray-500 text-sm">

                Total Employees

              </p>

              <p className="text-2xl font-bold">

                {employees.length}

              </p>

            </div>

          </div>

        </div>


        {/* --------------------------------------------------
            Employee Table
        -------------------------------------------------- */}

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-6 py-4 font-semibold">
                    Name
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Email
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 font-semibold">
                    Joined
                  </th>

                </tr>

              </thead>


              <tbody>

                {employees.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center py-12 text-gray-500"
                    >

                      <i className="fa-solid fa-users text-3xl mb-3 block"></i>

                      No employees found.

                      <br />

                      Click "Add Employee" to create one.

                    </td>

                  </tr>

                ) : (

                  employees.map(
                    employee => (

                      <tr
                        key={employee._id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">

                              <i className="fa-solid fa-user text-gray-500"></i>

                            </div>

                            <span className="font-medium">

                              {employee.name}

                            </span>

                          </div>

                        </td>


                        <td className="px-6 py-4 text-gray-600">

                          {employee.email}

                        </td>


                        <td className="px-6 py-4">

                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                            Employee

                          </span>

                        </td>


                        <td className="px-6 py-4 text-gray-600">

                          {
                            employee.createdAt
                              ? new Date(
                                  employee.createdAt
                                ).toLocaleDateString()
                              : "-"
                          }

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

};


export default Employees;