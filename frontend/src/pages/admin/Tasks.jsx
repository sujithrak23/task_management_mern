import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useSelector
} from "react-redux";

import api from "../../api";


const EMPTY_FORM = {

  title: "",

  description: "",

  assignedTo: "",

  priority: "Medium",

  status: "Not Started"

};


const AdminTasks = () => {

  const {
    token
  } = useSelector(
    state =>
      state.authReducer
  );


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
    saving,
    setSaving
  ] = useState(false);


  const [
    deletingId,
    setDeletingId
  ] = useState(null);


  const [
    error,
    setError
  ] = useState("");


  const [
    message,
    setMessage
  ] = useState("");


  const [
    search,
    setSearch
  ] = useState("");


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

    totalPages: 0

  });


  const [
    showForm,
    setShowForm
  ] = useState(false);


  const [
    editingTask,
    setEditingTask
  ] = useState(null);


  const [
    form,
    setForm
  ] = useState(
    EMPTY_FORM
  );


  const headers = {

    Authorization:
      token

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

          const {
            data
          } =
            await api.get(

              "/admin/employees",

              {
                headers
              }

            );


          setEmployees(

            data.employees ||
            []

          );

        }

        catch (err) {

          setError(

            err.response?.data?.msg ||

            "Unable to load employees"

          );

        }

      },
      [token]
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


          const {
            data
          } =
            await api.get(

              "/tasks/admin",

              {

                params: {

                  search,

                  page,

                  limit: 10

                },

                headers

              }

            );


          setTasks(

            data.tasks ||
            []

          );


          setPagination(

            data.pagination ||

            {

              page,

              limit: 10,

              total: 0,

              totalPages: 0

            }

          );


          setError("");

        }

        catch (err) {

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
        token,
        search,
        page
      ]
    );


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
  | FORM
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {

    setForm(
      EMPTY_FORM
    );

    setEditingTask(
      null
    );

  };


  const openCreate = () => {

    resetForm();

    setError("");

    setMessage("");

    setShowForm(true);

  };


  const openEdit = (
    task
  ) => {

    setEditingTask(
      task
    );


    setForm({

      title:
        task.title ||
        "",

      description:
        task.description ||
        "",

      assignedTo:
        task.assignedTo?._id ||
        "",

      priority:
        task.priority ||
        "Medium",

      status:
        task.status ||
        "Not Started"

    });


    setError("");

    setMessage("");

    setShowForm(true);


    window.scrollTo({

      top: 0,

      behavior:
        "smooth"

    });

  };


  const closeForm = () => {

    setShowForm(false);

    resetForm();

  };


  const handleChange = (
    event
  ) => {

    const {
      name,
      value
    } =
      event.target;


    setForm(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  };


  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async event => {

      event.preventDefault();


      setError("");

      setMessage("");


      if (
        !form.title.trim() ||
        !form.description.trim() ||
        !form.assignedTo
      ) {

        setError(
          "Please fill all the fields"
        );

        return;

      }


      try {

        setSaving(true);


        if (
          editingTask
        ) {

          const {
            data
          } =
            await api.put(

              `/tasks/admin/${editingTask._id}`,

              form,

              {
                headers
              }

            );


          setMessage(

            data.msg ||
            "Task updated successfully"

          );

        }

        else {

          const {
            data
          } =
            await api.post(

              "/tasks/admin",

              {

                title:
                  form.title,

                description:
                  form.description,

                assignedTo:
                  form.assignedTo,

                priority:
                  form.priority

              },

              {
                headers
              }

            );


          setMessage(

            data.msg ||
            "Task assigned successfully"

          );

        }


        closeForm();

        setPage(1);

        await fetchTasks();

      }

      catch (err) {

        setError(

          err.response?.data?.msg ||

          "Unable to save task"

        );

      }

      finally {

        setSaving(false);

      }

    };


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async task => {

      const confirmed =
        window.confirm(

          `Delete task "${task.title}"?`

        );


      if (!confirmed) {

        return;

      }


      try {

        setDeletingId(
          task._id
        );

        setError("");

        setMessage("");


        const {
          data
        } =
          await api.delete(

            `/tasks/admin/${task._id}`,

            {
              headers
            }

          );


        setMessage(

          data.msg ||
          "Task deleted successfully"

        );


        if (
          tasks.length === 1 &&
          page > 1
        ) {

          setPage(
            previous =>
              previous - 1
          );

        }

        else {

          await fetchTasks();

        }

      }

      catch (err) {

        setError(

          err.response?.data?.msg ||

          "Unable to delete task"

        );

      }

      finally {

        setDeletingId(
          null
        );

      }

    };


  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch =
    event => {

      setSearch(
        event.target.value
      );

      setPage(1);

    };


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const goToPage =
    nextPage => {

      if (
        nextPage < 1 ||
        nextPage >
          pagination.totalPages
      ) {

        return;

      }


      setPage(
        nextPage
      );

    };


  /*
  |--------------------------------------------------------------------------
  | BADGES
  |--------------------------------------------------------------------------
  */

  const statusClass =
    status => {

      if (
        status ===
        "Completed"
      ) {

        return (
          "bg-green-100 text-green-700"
        );

      }


      if (
        status ===
        "In Progress"
      ) {

        return (
          "bg-blue-100 text-blue-700"
        );

      }


      if (
        status ===
        "Pending"
      ) {

        return (
          "bg-yellow-100 text-yellow-700"
        );

      }


      return (
        "bg-gray-100 text-gray-700"
      );

    };


  const priorityClass =
    priority => {

      if (
        priority ===
        "High"
      ) {

        return (
          "bg-red-100 text-red-700"
        );

      }


      if (
        priority ===
        "Low"
      ) {

        return (
          "bg-green-100 text-green-700"
        );

      }


      return (
        "bg-yellow-100 text-yellow-700"
      );

    };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="p-4 md:p-8">

      <div className="max-w-7xl mx-auto">


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
            onClick={
              showForm
                ? closeForm
                : openCreate
            }
            className="bg-primary text-white px-5 py-3 rounded-md hover:opacity-90"
          >

            <i
              className={`fa-solid ${
                showForm
                  ? "fa-xmark"
                  : "fa-plus"
              } mr-2`}
            />


            {showForm
              ? "Cancel"
              : "Assign Task"
            }

          </button>

        </div>


        {message && (

          <div className="mb-5 bg-green-50 text-green-700 border border-green-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-check mr-2" />

            {message}

          </div>

        )}


        {error && (

          <div className="mb-5 bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-exclamation mr-2" />

            {error}

          </div>

        )}


        {showForm && (

          <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">

            <h2 className="text-xl font-semibold mb-5">

              {editingTask
                ? "Edit Task"
                : "Assign New Task"
              }

            </h2>


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              <div>

                <label className="block font-medium mb-2">

                  Task Title

                </label>


                <input
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  maxLength="150"
                  className="w-full border rounded-md px-4 py-3"
                  placeholder="Enter task title"
                />

              </div>


              <div>

                <label className="block font-medium mb-2">

                  Task Description

                </label>


                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  maxLength="2000"
                  rows="5"
                  className="w-full border rounded-md px-4 py-3 resize-none"
                  placeholder="Enter task description"
                />

              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                <div>

                  <label className="block font-medium mb-2">

                    Employee

                  </label>


                  <select
                    name="assignedTo"
                    value={
                      form.assignedTo
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white"
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


                <div>

                  <label className="block font-medium mb-2">

                    Priority

                  </label>


                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white"
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


                <div>

                  <label className="block font-medium mb-2">

                    Status

                  </label>


                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !editingTask
                    }
                    className="w-full border rounded-md px-4 py-3 bg-white disabled:bg-gray-100"
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

                </div>

              </div>


              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="bg-primary text-white px-6 py-3 rounded-md disabled:opacity-50"
                >

                  {saving
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
                  className="border px-6 py-3 rounded-md"
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        )}


        <div className="bg-white border rounded-lg shadow-sm p-4 mb-5">

          <div className="relative">

            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


            <input
              value={
                search
              }
              onChange={
                handleSearch
              }
              placeholder="Search tasks by title, description or employee..."
              className="w-full border rounded-md pl-11 pr-4 py-3"
            />

          </div>

        </div>


        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

          {loading ? (

            <div className="p-12 text-center text-gray-500">

              Loading tasks...

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">

                  <tr>

                    <th className="text-left px-5 py-4">
                      Task
                    </th>

                    <th className="text-left px-5 py-4">
                      Employee
                    </th>

                    <th className="text-left px-5 py-4">
                      Priority
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Created
                    </th>

                    <th className="text-left px-5 py-4">
                      Updated
                    </th>

                    <th className="text-left px-5 py-4">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {tasks.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-12 text-gray-500"
                      >

                        No tasks found.

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

                          <td className="px-5 py-4 min-w-[260px]">

                            <p className="font-semibold">

                              {task.title}

                            </p>


                            <p className="text-sm text-gray-500 mt-1">

                              {task.description}

                            </p>

                          </td>


                          <td className="px-5 py-4 min-w-[190px]">

                            <p className="font-medium">

                              {
                                task.assignedTo?.name ||
                                "Unassigned"
                              }

                            </p>


                            <p className="text-sm text-gray-500">

                              {
                                task.assignedTo?.email ||
                                ""
                              }

                            </p>

                          </td>


                          <td className="px-5 py-4">

                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm ${priorityClass(task.priority)}`}
                            >

                              {task.priority}

                            </span>

                          </td>


                          <td className="px-5 py-4">

                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm whitespace-nowrap ${statusClass(task.status)}`}
                            >

                              {task.status}

                            </span>

                          </td>


                          <td className="px-5 py-4 text-sm whitespace-nowrap">

                            {
                              task.createdAt

                                ? new Date(
                                    task.createdAt
                                  ).toLocaleDateString()

                                : "-"
                            }

                          </td>


                          <td className="px-5 py-4 text-sm whitespace-nowrap">

                            {
                              task.updatedAt

                                ? new Date(
                                    task.updatedAt
                                  ).toLocaleDateString()

                                : "-"
                            }

                          </td>


                          <td className="px-5 py-4">

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    task
                                  )
                                }
                                title="Edit task"
                                className="w-9 h-9 border rounded-md text-blue-600 hover:bg-blue-50"
                              >

                                <i className="fa-solid fa-pen" />

                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    task
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  task._id
                                }
                                title="Delete task"
                                className="w-9 h-9 border rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >

                                <i
                                  className={`fa-solid ${
                                    deletingId ===
                                    task._id
                                      ? "fa-spinner fa-spin"
                                      : "fa-trash"
                                  }`}
                                />

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


        {/* PAGINATION */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">

          <p className="text-sm text-gray-500">

            {pagination.total === 0

              ? "No tasks"

              : `Showing page ${pagination.page} of ${pagination.totalPages} · ${pagination.total} task${pagination.total === 1 ? "" : "s"}`

            }

          </p>


          <div className="flex items-center gap-1">

            <button
              type="button"
              disabled={
                page <= 1 ||
                !pagination.totalPages
              }
              onClick={() =>
                goToPage(
                  page - 1
                )
              }
              className="px-3 py-2 border rounded-md disabled:opacity-40"
            >

              <i className="fa-solid fa-chevron-left" />

            </button>


            {Array.from(

              {
                length:
                  Math.max(
                    pagination.totalPages,
                    1
                  )
              },

              (_, index) =>
                index + 1

            ).map(
              number => (

                <button
                  key={
                    number
                  }
                  type="button"
                  onClick={() =>
                    goToPage(
                      number
                    )
                  }
                  className={`min-w-[40px] px-3 py-2 border rounded-md ${
                    number === page
                      ? "bg-primary text-white border-primary"
                      : "hover:bg-gray-50"
                  }`}
                >

                  {number}

                </button>

              )
            )}


            <button
              type="button"
              disabled={
                page >=
                pagination.totalPages ||
                !pagination.totalPages
              }
              onClick={() =>
                goToPage(
                  page + 1
                )
              }
              className="px-3 py-2 border rounded-md disabled:opacity-40"
            >

              <i className="fa-solid fa-chevron-right" />

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};


export default AdminTasks;