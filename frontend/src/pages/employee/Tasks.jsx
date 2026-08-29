import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  useSelector
} from "react-redux";

import api from "../../api";


const EmployeeTasks = () => {

  const {
    token
  } = useSelector(
    state =>
      state.authReducer
  );


  const [
    tasks,
    setTasks
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    savingId,
    setSavingId
  ] = useState(null);


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
    editingTask,
    setEditingTask
  ] = useState(null);


  const [
    editForm,
    setEditForm
  ] = useState({

    title: "",

    description: "",

    priority: "Medium"

  });


  const headers = {

    Authorization:
      token

  };


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

              "/tasks/employee",

              {
                headers
              }

            );


          setTasks(

            data.tasks ||
            []

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
      [token]
    );


  useEffect(() => {

    fetchTasks();

  }, [
    fetchTasks
  ]);


  /*
  |--------------------------------------------------------------------------
  | STATUS UPDATE
  |--------------------------------------------------------------------------
  */

  const handleStatusChange =
    async (
      taskId,
      status
    ) => {

      try {

        setSavingId(
          taskId
        );

        setError("");

        setMessage("");


        const {
          data
        } =
          await api.patch(

            `/tasks/employee/${taskId}/status`,

            {
              status
            },

            {
              headers
            }

          );


        setTasks(
          previous =>
            previous.map(
              task =>
                task._id ===
                taskId

                  ? {

                      ...task,

                      status:
                        data.task.status,

                      updatedAt:
                        data.task.updatedAt

                    }

                  : task
            )
        );


        setMessage(

          data.msg ||

          "Task status updated successfully"

        );

      }

      catch (err) {

        setError(

          err.response?.data?.msg ||

          "Unable to update task status"

        );

      }

      finally {

        setSavingId(
          null
        );

      }

    };


  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT
  |--------------------------------------------------------------------------
  */

  const openEdit =
    task => {

      setEditingTask(
        task
      );


      setEditForm({

        title:
          task.title ||
          "",

        description:
          task.description ||
          "",

        priority:
          task.priority ||
          "Medium"

      });


      setError("");

      setMessage("");


      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

      });

    };


  /*
  |--------------------------------------------------------------------------
  | CLOSE EDIT
  |--------------------------------------------------------------------------
  */

  const closeEdit =
    () => {

      setEditingTask(
        null
      );


      setEditForm({

        title: "",

        description: "",

        priority:
          "Medium"

      });

    };


  /*
  |--------------------------------------------------------------------------
  | EDIT FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleEditChange =
    event => {

      const {
        name,
        value
      } =
        event.target;


      setEditForm(
        previous => ({

          ...previous,

          [name]:
            value

        })
      );

    };


  /*
  |--------------------------------------------------------------------------
  | EDIT SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleEditSubmit =
    async event => {

      event.preventDefault();


      setError("");

      setMessage("");


      if (
        !editForm.title.trim() ||
        !editForm.description.trim()
      ) {

        setError(

          "Task title and description are required"

        );

        return;

      }


      try {

        setSavingId(
          editingTask._id
        );


        const {
          data
        } =
          await api.put(

            `/tasks/employee/${editingTask._id}`,

            editForm,

            {
              headers
            }

          );


        setTasks(
          previous =>
            previous.map(
              task =>
                task._id ===
                editingTask._id

                  ? {

                      ...task,

                      ...data.task

                    }

                  : task
            )
        );


        setMessage(

          data.msg ||

          "Task updated successfully"

        );


        closeEdit();

      }

      catch (err) {

        setError(

          err.response?.data?.msg ||

          "Unable to update task"

        );

      }

      finally {

        setSavingId(
          null
        );

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

            `/tasks/employee/${task._id}`,

            {
              headers
            }

          );


        setTasks(
          previous =>
            previous.filter(
              item =>
                item._id !==
                task._id
            )
        );


        setMessage(

          data.msg ||

          "Task deleted successfully"

        );

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

      <div className="max-w-6xl mx-auto">


        <div className="mb-8">

          <h1 className="text-2xl md:text-3xl font-bold">

            My Tasks

          </h1>


          <p className="text-gray-500 mt-1">

            View, edit, delete and update your assigned tasks

          </p>

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


        {/* ==================================================
            EDIT FORM
        ================================================== */}

        {editingTask && (

          <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-semibold">

                Edit Task

              </h2>


              <button
                type="button"
                onClick={
                  closeEdit
                }
                className="text-gray-500 hover:text-gray-800"
              >

                <i className="fa-solid fa-xmark text-xl" />

              </button>

            </div>


            <form
              onSubmit={
                handleEditSubmit
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
                    editForm.title
                  }
                  onChange={
                    handleEditChange
                  }
                  maxLength="150"
                  className="w-full border rounded-md px-4 py-3"
                />

              </div>


              <div>

                <label className="block font-medium mb-2">

                  Task Description

                </label>


                <textarea
                  name="description"
                  value={
                    editForm.description
                  }
                  onChange={
                    handleEditChange
                  }
                  maxLength="2000"
                  rows="5"
                  className="w-full border rounded-md px-4 py-3 resize-none"
                />

              </div>


              <div className="max-w-sm">

                <label className="block font-medium mb-2">

                  Priority

                </label>


                <select
                  name="priority"
                  value={
                    editForm.priority
                  }
                  onChange={
                    handleEditChange
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


              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={
                    savingId ===
                    editingTask._id
                  }
                  className="bg-primary text-white px-6 py-3 rounded-md disabled:opacity-50"
                >

                  {savingId ===
                  editingTask._id

                    ? "Updating..."

                    : "Update Task"

                  }

                </button>


                <button
                  type="button"
                  onClick={
                    closeEdit
                  }
                  className="border px-6 py-3 rounded-md"
                >

                  Cancel

                </button>

              </div>

            </form>

          </div>

        )}


        {/* ==================================================
            TASKS
        ================================================== */}

        {loading ? (

          <div className="bg-white border rounded-lg p-10 text-center text-gray-500">

            Loading your tasks...

          </div>

        ) : tasks.length === 0 ? (

          <div className="bg-white border rounded-lg p-12 text-center">

            <i className="fa-solid fa-clipboard-check text-4xl text-gray-300 mb-4" />


            <h2 className="text-xl font-semibold">

              No tasks assigned

            </h2>


            <p className="text-gray-500 mt-2">

              You don't have any tasks assigned to you yet.

            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {tasks.map(
              task => (

                <div
                  key={
                    task._id
                  }
                  className="bg-white border rounded-lg shadow-sm p-5"
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">


                    <div>

                      <h2 className="text-xl font-semibold">

                        {task.title}

                      </h2>


                      <p className="text-gray-600 mt-2 whitespace-pre-wrap">

                        {task.description}

                      </p>

                    </div>


                    <div className="flex gap-2 flex-wrap">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${priorityClass(task.priority)}`}
                      >

                        {task.priority}
                        {" "}
                        Priority

                      </span>


                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(task.status)}`}
                      >

                        {task.status}

                      </span>

                    </div>

                  </div>


                  <div className="mt-6 pt-5 border-t flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">


                    <div className="text-sm text-gray-500">

                      <p>

                        Created:{" "}

                        {
                          task.createdAt

                            ? new Date(
                                task.createdAt
                              ).toLocaleDateString()

                            : "-"
                        }

                      </p>


                      <p className="mt-1">

                        Updated:{" "}

                        {
                          task.updatedAt

                            ? new Date(
                                task.updatedAt
                              ).toLocaleDateString()

                            : "-"
                        }

                      </p>

                    </div>


                    <div className="flex flex-col sm:flex-row gap-3">


                      {/* STATUS */}

                      <div className="flex items-center gap-3">

                        <label
                          htmlFor={
                            `status-${task._id}`
                          }
                          className="font-medium text-sm"
                        >

                          Status

                        </label>


                        <select
                          id={
                            `status-${task._id}`
                          }
                          value={
                            task.status
                          }
                          disabled={
                            savingId ===
                            task._id
                          }
                          onChange={
                            event =>
                              handleStatusChange(

                                task._id,

                                event.target.value

                              )
                          }
                          className="border rounded-md px-3 py-2 bg-white disabled:opacity-50"
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


                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            task
                          )
                        }
                        className="border rounded-md px-4 py-2 text-blue-600 hover:bg-blue-50"
                      >

                        <i className="fa-solid fa-pen mr-2" />

                        Edit

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
                          deletingId ===
                          task._id
                        }
                        className="border rounded-md px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >

                        <i
                          className={`fa-solid ${
                            deletingId ===
                            task._id

                              ? "fa-spinner fa-spin"

                              : "fa-trash"

                          } mr-2`}
                        />


                        {deletingId ===
                        task._id

                          ? "Deleting..."

                          : "Delete"

                        }

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

};


export default EmployeeTasks;