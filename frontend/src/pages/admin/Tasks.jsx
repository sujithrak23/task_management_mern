import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useSelector
} from "react-redux";

import api from "../../api";


const AdminTasks = () => {

  const authState =
    useSelector(
      state => state.authReducer
    );


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    employees,
    setEmployees
  ] = useState([]);


  const [
    tasks,
    setTasks
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    formLoading,
    setFormLoading
  ] = useState(false);


  const [
    deletingTaskId,
    setDeletingTaskId
  ] = useState(null);


  const [
    error,
    setError
  ] = useState("");


  const [
    formError,
    setFormError
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const [
    search,
    setSearch
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const [
    page,
    setPage
  ] = useState(1);


  const [
    pagination,
    setPagination
  ] = useState({

    page: 1,

    limit: 10,

    total: 0,

    totalPages: 1

  });


  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [
    showForm,
    setShowForm
  ] = useState(false);


  const [
    editingTask,
    setEditingTask
  ] = useState(null);


  const [
    formData,
    setFormData
  ] = useState({

    title: "",

    description: "",

    assignedTo: "",

    priority: "Medium",

    status: "Not Started"

  });


  /*
  |--------------------------------------------------------------------------
  | AUTH HEADER
  |--------------------------------------------------------------------------
  */

  const getHeaders = () => {

    return {

      Authorization:
        authState.token

    };

  };


  /*
  |--------------------------------------------------------------------------
  | FETCH EMPLOYEES
  |--------------------------------------------------------------------------
  */

  const fetchEmployees =
    useCallback(
      async () => {

        try {

          const response =
            await api.get(

              "/admin/employees",

              {
                headers:
                  getHeaders()
              }

            );


          setEmployees(

            response.data.employees ||
            []

          );

        }

        catch (err) {

          console.error(err);

          setError(

            err.response?.data?.msg ||

            "Unable to load employees"

          );

        }

      },
      [
        authState.token
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | FETCH TASKS
  |--------------------------------------------------------------------------
  */

  const fetchTasks =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await api.get(

              "/tasks/admin",

              {

                params: {

                  search,

                  page,

                  limit: 10

                },

                headers:
                  getHeaders()

              }

            );


          setTasks(

            response.data.tasks ||
            []

          );


          setPagination(

            response.data.pagination ||

            {

              page,

              limit: 10,

              total: 0,

              totalPages: 1

            }

          );

        }

        catch (err) {

          console.error(err);

          setError(

            err.response?.data?.msg ||

            "Unable to load tasks"

          );

        }

        finally {

          setLoading(false);

        }

      },
      [
        authState.token,
        search,
        page
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    fetchEmployees();

  }, [
    fetchEmployees
  ]);


  useEffect(() => {

    fetchTasks();

  }, [
    fetchTasks
  ]);


  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  };


  /*
  |--------------------------------------------------------------------------
  | RESET FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {

    setFormData({

      title: "",

      description: "",

      assignedTo: "",

      priority: "Medium",

      status: "Not Started"

    });


    setEditingTask(null);

    setFormError("");

  };


  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE FORM
  |--------------------------------------------------------------------------
  */

  const openCreateForm = () => {

    resetForm();

    setSuccessMessage("");

    setShowForm(true);

  };


  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT FORM
  |--------------------------------------------------------------------------
  */

  const openEditForm = (
    task
  ) => {

    setEditingTask(task);

    setFormError("");

    setSuccessMessage("");


    setFormData({

      title:
        task.title || "",

      description:
        task.description || "",

      assignedTo:
        task.assignedTo?._id || "",

      priority:
        task.priority || "Medium",

      status:
        task.status || "Not Started"

    });


    setShowForm(true);


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE FORM
  |--------------------------------------------------------------------------
  */

  const closeForm = () => {

    setShowForm(false);

    resetForm();

  };


  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE TASK
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      setFormError("");

      setSuccessMessage("");


      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */

      if (
        !formData.title.trim()
      ) {

        setFormError(
          "Task title is required"
        );

        return;

      }


      if (
        !formData.description.trim()
      ) {

        setFormError(
          "Task description is required"
        );

        return;

      }


      if (
        !formData.assignedTo
      ) {

        setFormError(
          "Please select an employee"
        );

        return;

      }


      if (
        !formData.priority
      ) {

        setFormError(
          "Please select a priority"
        );

        return;

      }


      try {

        setFormLoading(true);


        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if (editingTask) {

          const response =
            await api.put(

              `/tasks/admin/${editingTask._id}`,

              {

                title:
                  formData.title.trim(),

                description:
                  formData.description.trim(),

                assignedTo:
                  formData.assignedTo,

                priority:
                  formData.priority,

                status:
                  formData.status

              },

              {

                headers:
                  getHeaders()

              }

            );


          setSuccessMessage(

            response.data.msg ||

            "Task updated successfully"

          );

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        else {

          const response =
            await api.post(

              "/tasks/admin",

              {

                title:
                  formData.title.trim(),

                description:
                  formData.description.trim(),

                assignedTo:
                  formData.assignedTo,

                priority:
                  formData.priority

              },

              {

                headers:
                  getHeaders()

              }

            );


          setSuccessMessage(

            response.data.msg ||

            "Task assigned successfully"

          );

        }


        /*
        |--------------------------------------------------------------------------
        | Close form
        |--------------------------------------------------------------------------
        */

        setShowForm(false);

        resetForm();


        /*
        |--------------------------------------------------------------------------
        | Go back to first page
        |--------------------------------------------------------------------------
        */

        if (
          page !== 1
        ) {

          setPage(1);

        }

        else {

          fetchTasks();

        }

      }

      catch (err) {

        console.error(err);

        setFormError(

          err.response?.data?.msg ||

          "Unable to save task"

        );

      }

      finally {

        setFormLoading(false);

      }

    };


  /*
  |--------------------------------------------------------------------------
  | DELETE TASK
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (task) => {

      const confirmed =
        window.confirm(

          `Are you sure you want to delete "${task.title}"?`

        );


      if (!confirmed) {

        return;

      }


      try {

        setDeletingTaskId(
          task._id
        );

        setError("");

        setSuccessMessage("");


        const response =
          await api.delete(

            `/tasks/admin/${task._id}`,

            {

              headers:
                getHeaders()

            }

          );


        setSuccessMessage(

          response.data.msg ||

          "Task deleted successfully"

        );


        /*
        |--------------------------------------------------------------------------
        | If deleting the last task on a page,
        | move to previous page.
        |--------------------------------------------------------------------------
        */

        if (
          tasks.length === 1 &&
          page > 1
        ) {

          setPage(
            page - 1
          );

        }

        else {

          fetchTasks();

        }

      }

      catch (err) {

        console.error(err);

        setError(

          err.response?.data?.msg ||

          "Unable to delete task"

        );

      }

      finally {

        setDeletingTaskId(null);

      }

    };


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch = (e) => {

    setSearch(
      e.target.value
    );


    setPage(1);

  };


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const goToPage = (
    selectedPage
  ) => {

    if (
      selectedPage < 1 ||
      selectedPage >
        pagination.totalPages
    ) {

      return;

    }


    setPage(
      selectedPage
    );

  };


  /*
  |--------------------------------------------------------------------------
  | PAGE NUMBERS
  |--------------------------------------------------------------------------
  */

  const getPageNumbers = () => {

    const totalPages =
      pagination.totalPages || 1;


    const currentPage =
      pagination.page || page;


    const pages = [];


    /*
    |--------------------------------------------------------------------------
    | Small number of pages
    |--------------------------------------------------------------------------
    */

    if (
      totalPages <= 5
    ) {

      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {

        pages.push(i);

      }


      return pages;

    }


    /*
    |--------------------------------------------------------------------------
    | Always show first page
    |--------------------------------------------------------------------------
    */

    pages.push(1);


    /*
    |--------------------------------------------------------------------------
    | Middle pages
    |--------------------------------------------------------------------------
    */

    let start =
      Math.max(
        currentPage - 1,
        2
      );


    let end =
      Math.min(
        currentPage + 1,
        totalPages - 1
      );


    if (
      start > 2
    ) {

      pages.push("...");

    }


    for (
      let i = start;
      i <= end;
      i++
    ) {

      pages.push(i);

    }


    if (
      end < totalPages - 1
    ) {

      pages.push("...");

    }


    /*
    |--------------------------------------------------------------------------
    | Last page
    |--------------------------------------------------------------------------
    */

    pages.push(
      totalPages
    );


    return pages;

  };


  /*
  |--------------------------------------------------------------------------
  | STATUS BADGE
  |--------------------------------------------------------------------------
  */

  const statusClass = (
    status
  ) => {

    switch (status) {

      case "Completed":

        return (
          "bg-green-100 text-green-700"
        );


      case "In Progress":

        return (
          "bg-blue-100 text-blue-700"
        );


      case "Pending":

        return (
          "bg-yellow-100 text-yellow-700"
        );


      default:

        return (
          "bg-gray-100 text-gray-700"
        );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | PRIORITY BADGE
  |--------------------------------------------------------------------------
  */

  const priorityClass = (
    priority
  ) => {

    switch (priority) {

      case "High":

        return (
          "bg-red-100 text-red-700"
        );


      case "Low":

        return (
          "bg-green-100 text-green-700"
        );


      default:

        return (
          "bg-yellow-100 text-yellow-700"
        );

    }

  };


  return (

    <div className="p-4 md:p-8">

      <div className="max-w-7xl mx-auto">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <h1 className="text-2xl md:text-3xl font-bold">

              Task Management

            </h1>


            <p className="text-gray-500 mt-1">

              Create, assign, edit and monitor tasks

            </p>

          </div>


          <button
            type="button"
            onClick={() => {

              if (showForm) {

                closeForm();

              }

              else {

                openCreateForm();

              }

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


            {showForm
              ? "Cancel"
              : "Assign Task"
            }

          </button>

        </div>


        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {successMessage && (

          <div className="mb-5 bg-green-50 text-green-700 border border-green-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-check mr-2"></i>

            {successMessage}

          </div>

        )}


        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (

          <div className="mb-5 bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-exclamation mr-2"></i>

            {error}

          </div>

        )}


        {/* ==================================================
            CREATE / EDIT FORM
        ================================================== */}

        {showForm && (

          <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-semibold">

                {editingTask
                  ? "Edit Task"
                  : "Assign New Task"
                }

              </h2>


              <button
                type="button"
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-800"
              >

                <i className="fa-solid fa-xmark text-xl"></i>

              </button>

            </div>


            {formError && (

              <div className="mb-5 bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3">

                <i className="fa-solid fa-circle-exclamation mr-2"></i>

                {formError}

              </div>

            )}


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >


              {/* ------------------------------------------------
                  TITLE
              ------------------------------------------------ */}

              <div>

                <label
                  htmlFor="title"
                  className="block font-medium mb-2"
                >

                  Task Title

                </label>


                <input
                  id="title"
                  name="title"
                  type="text"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter task title"
                  maxLength="150"
                  className="w-full border rounded-md px-4 py-3 outline-none focus:border-primary"
                />

              </div>


              {/* ------------------------------------------------
                  DESCRIPTION
              ------------------------------------------------ */}

              <div>

                <label
                  htmlFor="description"
                  className="block font-medium mb-2"
                >

                  Task Description

                </label>


                <textarea
                  id="description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter detailed task description"
                  rows="5"
                  maxLength="2000"
                  className="w-full border rounded-md px-4 py-3 outline-none focus:border-primary resize-none"
                />

              </div>


              {/* ------------------------------------------------
                  EMPLOYEE / PRIORITY / STATUS
              ------------------------------------------------ */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                {/* Employee */}

                <div>

                  <label
                    htmlFor="assignedTo"
                    className="block font-medium mb-2"
                  >

                    Assign Employee

                  </label>


                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={
                      formData.assignedTo
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white outline-none focus:border-primary"
                  >

                    <option value="">

                      Select employee

                    </option>


                    {employees.map(
                      employee => (

                        <option
                          key={
                            employee._id
                          }
                          value={
                            employee._id
                          }
                        >

                          {employee.name}
                          {" - "}
                          {employee.email}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* Priority */}

                <div>

                  <label
                    htmlFor="priority"
                    className="block font-medium mb-2"
                  >

                    Priority

                  </label>


                  <select
                    id="priority"
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white outline-none focus:border-primary"
                  >

                    <option value="High">

                      High

                    </option>


                    <option value="Medium">

                      Medium

                    </option>


                    <option value="Low">

                      Low

                    </option>

                  </select>

                </div>


                {/* Status */}

                <div>

                  <label
                    htmlFor="status"
                    className="block font-medium mb-2"
                  >

                    Status

                  </label>


                  <select
                    id="status"
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !editingTask
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white outline-none focus:border-primary disabled:bg-gray-100 disabled:text-gray-500"
                  >

                    <option value="Not Started">

                      Not Started

                    </option>


                    <option value="Pending">

                      Pending

                    </option>


                    <option value="In Progress">

                      In Progress

                    </option>


                    <option value="Completed">

                      Completed

                    </option>

                  </select>


                  {!editingTask && (

                    <p className="text-xs text-gray-400 mt-1">

                      New tasks start as Not Started.

                    </p>

                  )}

                </div>

              </div>


              {/* ------------------------------------------------
                  BUTTONS
              ------------------------------------------------ */}

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={
                    formLoading
                  }
                  className="bg-primary text-white px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-50"
                >

                  {formLoading

                    ? "Saving..."

                    : editingTask
                      ? "Update Task"
                      : "Assign Task"

                  }

                </button>


                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  className="border px-6 py-3 rounded-md hover:bg-gray-50"
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        )}


        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="bg-white border rounded-lg shadow-sm p-4 mb-5">

          <div className="relative">

            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>


            <input
              type="text"
              value={
                search
              }
              onChange={
                handleSearch
              }
              placeholder="Search tasks by title, description or employee..."
              className="w-full border rounded-md pl-11 pr-4 py-3 outline-none focus:border-primary"
            />

          </div>

        </div>


        {/* ==================================================
            TASK TABLE
        ================================================== */}

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

          {loading ? (

            <div className="p-12 text-center text-gray-500">

              <i className="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>

              <p>

                Loading tasks...

              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">

                  <tr>

                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Task

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Employee

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Priority

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Status

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Created

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Updated

                    </th>


                    <th className="text-left px-5 py-4 font-semibold whitespace-nowrap">

                      Actions

                    </th>

                  </tr>

                </thead>


                <tbody>

                  {tasks.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-14 text-gray-500"
                      >

                        <i className="fa-solid fa-list-check text-3xl mb-3 block"></i>


                        <p className="font-medium">

                          No tasks found

                        </p>


                        {search && (

                          <p className="text-sm mt-1">

                            Try a different search term.

                          </p>

                        )}

                      </td>

                    </tr>

                  ) : (

                    tasks.map(
                      task => (

                        <tr
                          key={
                            task._id
                          }
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >


                          {/* TASK */}

                          <td className="px-5 py-4 min-w-[250px]">

                            <p className="font-semibold text-gray-800">

                              {task.title}

                            </p>


                            <p className="text-sm text-gray-500 mt-1 max-w-sm">

                              {task.description}

                            </p>

                          </td>


                          {/* EMPLOYEE */}

                          <td className="px-5 py-4 min-w-[190px]">

                            {task.assignedTo ? (

                              <>

                                <p className="font-medium">

                                  {
                                    task.assignedTo.name
                                  }

                                </p>


                                <p className="text-sm text-gray-500">

                                  {
                                    task.assignedTo.email
                                  }

                                </p>

                              </>

                            ) : (

                              <span className="text-gray-400">

                                Unassigned

                              </span>

                            )}

                          </td>


                          {/* PRIORITY */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${priorityClass(task.priority)}`}
                            >

                              {task.priority}

                            </span>

                          </td>


                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusClass(task.status)}`}
                            >

                              {task.status}

                            </span>

                          </td>


                          {/* CREATED */}

                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">

                            {task.createdAt
                              ? new Date(
                                  task.createdAt
                                ).toLocaleDateString()
                              : "-"
                            }

                          </td>


                          {/* UPDATED */}

                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">

                            {task.updatedAt
                              ? new Date(
                                  task.updatedAt
                                ).toLocaleDateString()
                              : "-"
                            }

                          </td>


                          {/* ACTIONS */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">


                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    task
                                  )
                                }
                                title="Edit task"
                                className="w-9 h-9 border rounded-md text-blue-600 hover:bg-blue-50 transition"
                              >

                                <i className="fa-solid fa-pen"></i>

                              </button>


                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    task
                                  )
                                }
                                disabled={
                                  deletingTaskId ===
                                  task._id
                                }
                                title="Delete task"
                                className="w-9 h-9 border rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                              >

                                {deletingTaskId ===
                                task._id ? (

                                  <i className="fa-solid fa-spinner fa-spin"></i>

                                ) : (

                                  <i className="fa-solid fa-trash"></i>

                                )}

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ==================================================
            PAGINATION
            ALWAYS VISIBLE
        ================================================== */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">

          <p className="text-sm text-gray-500">

            {pagination.total === 0

              ? "No tasks"

              : (

                <>
                  Showing page{" "}
                  <span className="font-medium text-gray-700">

                    {pagination.page}

                  </span>
                  {" "}of{" "}
                  <span className="font-medium text-gray-700">

                    {pagination.totalPages}

                  </span>

                  {" "}·{" "}

                  <span className="font-medium text-gray-700">

                    {pagination.total}

                  </span>

                  {" "}
                  {pagination.total === 1
                    ? "task"
                    : "tasks"
                  }

                </>

              )

            }

          </p>


          {/* PAGINATION CONTROLS */}

          <div className="flex items-center gap-1">


            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                page <= 1 ||
                pagination.totalPages <= 1
              }
              onClick={() =>
                goToPage(
                  page - 1
                )
              }
              className="px-3 py-2 border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >

              <i className="fa-solid fa-chevron-left"></i>

            </button>


            {/* PAGE NUMBERS */}

            {getPageNumbers().map(
              (pageNumber, index) => {

                if (
                  pageNumber === "..."
                ) {

                  return (

                    <span
                      key={
                        `dots-${index}`
                      }
                      className="px-3 py-2 text-gray-500"
                    >

                      ...

                    </span>

                  );

                }


                return (

                  <button
                    key={
                      pageNumber
                    }
                    type="button"
                    onClick={() =>
                      goToPage(
                        pageNumber
                      )
                    }
                    className={`min-w-[40px] px-3 py-2 border rounded-md transition ${
                      pageNumber === page
                        ? "bg-primary text-white border-primary"
                        : "hover:bg-gray-50"
                    }`}
                  >

                    {pageNumber}

                  </button>

                );

              }
            )}


            {/* NEXT */}

            <button
              type="button"
              disabled={
                page >=
                pagination.totalPages ||
                pagination.totalPages <= 1
              }
              onClick={() =>
                goToPage(
                  page + 1
                )
              }
              className="px-3 py-2 border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >

              <i className="fa-solid fa-chevron-right"></i>

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};


export default AdminTasks;