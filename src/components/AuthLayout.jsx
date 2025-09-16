import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginToken } from "../utils/auth";
import ThemeToggle from "./ThemeToggle";

const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getLoginToken();
    console.log(token);
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="auth-layout">
      {/* <ThemeToggle /> */}
      {children}
    </div>
  );
};

export default AuthLayout;
