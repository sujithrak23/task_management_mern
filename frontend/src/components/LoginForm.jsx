import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import validateManyFields
  from "../validations";

import Input
  from "./utils/Input";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  postLoginData
} from "../redux/actions/authActions";

import Loader
  from "./utils/Loader";


const LoginForm = ({
  redirectUrl,
  loginRole
}) => {


  /*
  |--------------------------------------------------------------------------
  | Form state
  |--------------------------------------------------------------------------
  */

  const [formErrors, setFormErrors] =
    useState({});


  const [formData, setFormData] =
    useState({
      email: "",
      password: ""
    });


  const navigate = useNavigate();

  const dispatch = useDispatch();


  /*
  |--------------------------------------------------------------------------
  | Redux authentication state
  |--------------------------------------------------------------------------
  */

  const authState = useSelector(
    state => state.authReducer
  );


  const {
    loading,
    isLoggedIn,
    user
  } = authState;


  /*
  |--------------------------------------------------------------------------
  | Redirect after login
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!isLoggedIn) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | We determine the destination using the role returned
    | by the backend.
    |--------------------------------------------------------------------------
    */


    if (user?.role === "admin") {

      navigate("/admin/dashboard");

      return;

    }


    if (user?.role === "employee") {

      navigate("/employee/dashboard");

      return;

    }


    // Fallback

    navigate(
      redirectUrl || "/"
    );

  }, [
    isLoggedIn,
    user,
    navigate,
    redirectUrl
  ]);


  /*
  |--------------------------------------------------------------------------
  | Input change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  /*
  |--------------------------------------------------------------------------
  | Submit login
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {

    e.preventDefault();


    const errors =
      validateManyFields(
        "login",
        formData
      );


    setFormErrors({});


    if (errors.length > 0) {

      setFormErrors(
        errors.reduce(
          (total, ob) => ({
            ...total,
            [ob.field]: ob.err
          }),
          {}
        )
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | We DO NOT send loginRole to backend.
    |
    | Backend determines the user's real role from MongoDB.
    |--------------------------------------------------------------------------
    */

    dispatch(
      postLoginData(
        formData.email,
        formData.password
      )
    );

  };


  /*
  |--------------------------------------------------------------------------
  | Display validation error
  |--------------------------------------------------------------------------
  */

  const fieldError = (field) => (

    <p
      className={`mt-1 text-pink-600 text-sm ${
        formErrors[field]
          ? "block"
          : "hidden"
      }`}
    >

      <i className="mr-2 fa-solid fa-circle-exclamation"></i>

      {formErrors[field]}

    </p>

  );


  /*
  |--------------------------------------------------------------------------
  | Login page title
  |--------------------------------------------------------------------------
  */

  const title =
    loginRole === "admin"
      ? "Admin Login"
      : loginRole === "employee"
        ? "Employee Login"
        : "Login";


  /*
  |--------------------------------------------------------------------------
  | Login description
  |--------------------------------------------------------------------------
  */

  const description =
    loginRole === "admin"
      ? "Login to access the Admin dashboard"
      : loginRole === "employee"
        ? "Login to access your assigned tasks"
        : "Please enter your credentials to continue";


  return (

    <form
      className="m-auto my-16 max-w-[500px] bg-white p-8 border-2 shadow-md rounded-md"
      onSubmit={handleSubmit}
    >

      {loading ? (

        <Loader />

      ) : (

        <>

          {/* --------------------------------------------------
              Heading
          -------------------------------------------------- */}

          <h2 className="text-center mb-2 text-xl font-semibold">

            {title}

          </h2>


          {/* --------------------------------------------------
              Description
          -------------------------------------------------- */}

          <p className="text-center text-gray-500 mb-6">

            {description}

          </p>


          {/* --------------------------------------------------
              Email
          -------------------------------------------------- */}

          <div className="mb-4">

            <label
              htmlFor="email"
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
            >

              Email

            </label>


            <Input
              type="text"
              name="email"
              id="email"
              value={formData.email}
              placeholder="youremail@domain.com"
              onChange={handleChange}
            />


            {fieldError("email")}

          </div>


          {/* --------------------------------------------------
              Password
          -------------------------------------------------- */}

          <div className="mb-4">

            <label
              htmlFor="password"
              className="after:content-['*'] after:ml-0.5 after:text-red-500"
            >

              Password

            </label>


            <Input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              placeholder="Your password.."
              onChange={handleChange}
            />


            {fieldError("password")}

          </div>


          {/* --------------------------------------------------
              Login button
          -------------------------------------------------- */}

          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark"
          >

            Login

          </button>


          {/* --------------------------------------------------
              Signup
          -------------------------------------------------- */}

          {loginRole !== "admin" && (

            <div className="pt-4">

              <Link
                to="/signup"
                className="text-blue-400"
              >

                Don't have an account? Signup here

              </Link>

            </div>

          )}

        </>

      )}

    </form>

  );

};


export default LoginForm;