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

  const authState =
    useSelector(
      state => state.authReducer
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
    updatingId,
    setUpdatingId
  ] = useState(null);


  const [
    error,
    setError
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | Fetch assigned tasks
  |--------------------------------------------------------------------------
  */

  const fetchTasks =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const { data } =
            await api.get(
              "/tasks/employee",
              {
                headers: {
                  Authorization:
                    authState.token
                }
              }
            );


          setTasks(
            data.tasks || []
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
      [authState.token]
    );


  useEffect(() => {

    fetchTasks();

  }, [fetchTasks]);


  /*
  |--------------------------------------------------------------------------
  | Update status
  |--------------------------------------------------------------------------
  */

  const handleStatusChange =
    async (
      taskId,
      status
    ) => {

      try {

        setUpdatingId(taskId);


        const { data } =
          await api.patch(
            `/tasks/employee/${taskId}/status`,
            {
              status
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
        | Update local task
        |--------------------------------------------------------------------------
        */

        setTasks(
          previous =>
            previous.map(
              task =>
                task._id === taskId
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

      }

      catch (err) {

        console.error(err);

        setError(
          err.response?.data?.msg ||
          "Unable to update task status"
        );

      }

      finally {

        setUpdatingId(null);

      }

    };


  /*
  |--------------------------------------------------------------------------
  | Status class
  |--------------------------------------------------------------------------
  */

  const statusClass = (
    status
  ) => {

    if (
      status === "Completed"
    ) {

      return "bg-green-100 text-green-700";

    }


    if (
      status === "In Progress"
    ) {

      return "bg-blue-100 text-blue-700";

    }


    if (
      status === "Pending"
    ) {

      return "bg-yellow-100 text-yellow-700";

    }


    return "bg-gray-100 text-gray-700";

  };


  /*
  |--------------------------------------------------------------------------
  | Priority class
  |--------------------------------------------------------------------------
  */

  const priorityClass = (
    priority
  ) => {

    if (
      priority === "High"
    ) {

      return "bg-red-100 text-red-700";

    }


    if (
      priority === "Low"
    ) {

      return "bg-green-100 text-green-700";

    }


    return "bg-yellow-100 text-yellow-700";

  };


  return (

    <div className="p-4 md:p-8">

      <div className="max-w-6xl mx-auto">


        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <div className="mb-8">

          <h1 className="text-2xl md:text-3xl font-bold">

            My Tasks

          </h1>

          <p className="text-gray-500 mt-1">

            View and update your assigned tasks

          </p>

        </div>


        {/* --------------------------------------------------
            Error
        -------------------------------------------------- */}

        {error && (

          <div className="mb-6 bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3">

            <i className="fa-solid fa-circle-exclamation mr-2"></i>

            {error}

          </div>

        )}


        {/* --------------------------------------------------
            Loading
        -------------------------------------------------- */}

        {loading ? (

          <div className="bg-white border rounded-lg p-10 text-center text-gray-500">

            Loading your tasks...

          </div>

        ) : tasks.length === 0 ? (

          <div className="bg-white border rounded-lg p-12 text-center">

            <i className="fa-solid fa-clipboard-check text-4xl text-gray-300 mb-4"></i>

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
                  key={task._id}
                  className="bg-white border rounded-lg shadow-sm p-5"
                >


                  {/* ------------------------------------------------
                      Top
                  ------------------------------------------------ */}

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

                        {task.priority} Priority

                      </span>


                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(task.status)}`}
                      >

                        {task.status}

                      </span>

                    </div>

                  </div>


                  {/* ------------------------------------------------
                      Bottom
                  ------------------------------------------------ */}

                  <div className="mt-6 pt-5 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                    <div className="text-sm text-gray-500">

                      <p>

                        Created:{" "}

                        {new Date(
                          task.createdAt
                        ).toLocaleDateString()}

                      </p>

                      <p className="mt-1">

                        Updated:{" "}

                        {new Date(
                          task.updatedAt
                        ).toLocaleDateString()}

                      </p>

                    </div>


                    {/* Status selector */}

                    <div className="flex items-center gap-3">

                      <label
                        htmlFor={`status-${task._id}`}
                        className="font-medium text-sm"
                      >

                        Update Status

                      </label>


                      <select
                        id={`status-${task._id}`}
                        value={task.status}
                        disabled={
                          updatingId === task._id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            task._id,
                            e.target.value
                          )
                        }
                        className="border rounded-md px-3 py-2 bg-white outline-none focus:border-primary disabled:opacity-50"
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


                      {updatingId ===
                        task._id && (

                        <span className="text-sm text-gray-500">

                          Updating...

                        </span>

                      )}

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