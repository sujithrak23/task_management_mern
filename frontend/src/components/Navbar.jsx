import React, {
  useState
} from "react";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  Link
} from "react-router-dom";

import {
  logout
} from "../redux/actions/authActions";


const Navbar = () => {

  const authState =
    useSelector(
      state => state.authReducer
    );


  const dispatch =
    useDispatch();


  const [
    isNavbarOpen,
    setIsNavbarOpen
  ] = useState(false);


  const isAdmin =
    authState.user?.role === "admin";


  const isEmployee =
    authState.user?.role === "employee";


  const closeMenu = () => {

    setIsNavbarOpen(false);

  };


  const handleLogout = () => {

    dispatch(
      logout()
    );

  };


  return (

    <header className="flex justify-between sticky top-0 z-50 p-4 bg-white shadow-sm items-center">


      {/* --------------------------------------------------
          Logo
      -------------------------------------------------- */}

      <Link
        to="/"
        className="uppercase font-medium"
      >

        Task Manager

      </Link>


      {/* ==================================================
          DESKTOP
      ================================================== */}

      <ul className="hidden md:flex gap-2 items-center uppercase font-medium">


        {!authState.isLoggedIn ? (

          <>

            <li>

              <Link
                to="/login"
                state={{
                  loginRole: "admin"
                }}
                className="px-3 py-2 text-primary"
              >

                Login

              </Link>

            </li>

          </>

        ) : (

          <>


            {/* ------------------------------------------------
                ADMIN
            ------------------------------------------------ */}

            {isAdmin && (

              <>

                <li>

                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-2 hover:bg-gray-100 rounded"
                  >

                    Dashboard

                  </Link>

                </li>


                <li>

                  <Link
                    to="/admin/employees"
                    className="px-3 py-2 hover:bg-gray-100 rounded"
                  >

                    Employees

                  </Link>

                </li>


                <li>

                  <Link
                    to="/admin/tasks"
                    className="px-3 py-2 hover:bg-gray-100 rounded"
                  >

                    Tasks

                  </Link>

                </li>

              </>

            )}


            {/* ------------------------------------------------
                EMPLOYEE
            ------------------------------------------------ */}

            {isEmployee && (

              <>

                <li>

                  <Link
                    to="/employee/dashboard"
                    className="px-3 py-2 hover:bg-gray-100 rounded"
                  >

                    Dashboard

                  </Link>

                </li>


                <li>

                  <Link
                    to="/employee/tasks"
                    className="px-3 py-2 hover:bg-gray-100 rounded"
                  >

                    My Tasks

                  </Link>

                </li>

              </>

            )}


            {/* ------------------------------------------------
                Logout
            ------------------------------------------------ */}

            <li>

              <button
                onClick={handleLogout}
                className="px-3 py-2 hover:bg-gray-100 rounded"
              >

                <i className="fa-solid fa-right-from-bracket mr-2"></i>

                Logout

              </button>

            </li>

          </>

        )}

      </ul>


      {/* ==================================================
          MOBILE BUTTON
      ================================================== */}

      <button
        className="md:hidden"
        onClick={() =>
          setIsNavbarOpen(
            !isNavbarOpen
          )
        }
      >

        <i className="fa-solid fa-bars"></i>

      </button>


      {/* ==================================================
          MOBILE MENU
      ================================================== */}

      {isNavbarOpen && (

        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-white shadow-lg md:hidden">

          <div className="flex justify-end p-4">

            <button
              onClick={closeMenu}
            >

              <i className="fa-solid fa-xmark text-xl"></i>

            </button>

          </div>


          <ul className="flex flex-col gap-2 px-5 text-center uppercase font-medium">


            {!authState.isLoggedIn ? (

              <li>

                <Link
                  to="/login"
                  state={{
                    loginRole: "admin"
                  }}
                  onClick={closeMenu}
                  className="block py-3"
                >

                  Login

                </Link>

              </li>

            ) : (

              <>


                {isAdmin && (

                  <>

                    <li>

                      <Link
                        to="/admin/dashboard"
                        onClick={closeMenu}
                        className="block py-3"
                      >

                        Dashboard

                      </Link>

                    </li>


                    <li>

                      <Link
                        to="/admin/employees"
                        onClick={closeMenu}
                        className="block py-3"
                      >

                        Employees

                      </Link>

                    </li>


                    <li>

                      <Link
                        to="/admin/tasks"
                        onClick={closeMenu}
                        className="block py-3"
                      >

                        Tasks

                      </Link>

                    </li>

                  </>

                )}


                {isEmployee && (

                  <>

                    <li>

                      <Link
                        to="/employee/dashboard"
                        onClick={closeMenu}
                        className="block py-3"
                      >

                        Dashboard

                      </Link>

                    </li>


                    <li>

                      <Link
                        to="/employee/tasks"
                        onClick={closeMenu}
                        className="block py-3"
                      >

                        My Tasks

                      </Link>

                    </li>

                  </>

                )}


                <li>

                  <button
                    onClick={handleLogout}
                    className="py-3"
                  >

                    Logout

                  </button>

                </li>

              </>

            )}

          </ul>

        </div>

      )}

    </header>

  );

};


export default Navbar;