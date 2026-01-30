import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginToken } from "../utils/auth";
import { removeAuthToken } from "../api";
import ThemeToggle from "./ThemeToggle";

const AuthLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = getLoginToken();
      if (!token) {
        // Clear any stale data
        removeAuthToken();
        navigate("/login", { replace: true });
      }
    };
    
    checkAuth();
    
    // Check token validity every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="auth-layout">
      {/* <ThemeToggle /> */}
      {children}
    </div>
  );
};

export default AuthLayout;
