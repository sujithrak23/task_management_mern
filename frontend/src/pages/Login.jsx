import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import MainLayout from '../layouts/MainLayout'

const Login = () => {

  const { state } = useLocation();

  const redirectUrl = state?.redirectUrl || null;
  const loginRole = state?.loginRole || null;

  useEffect(() => {

    document.title =
      loginRole === 'admin'
        ? 'Admin Login'
        : loginRole === 'employee'
          ? 'Employee Login'
          : 'Login';

  }, [loginRole]);

  return (
    <>
      <MainLayout>
        <LoginForm
          redirectUrl={redirectUrl}
          loginRole={loginRole}
        />
      </MainLayout>
    </>
  )
}

export default Login