import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoginToken } from '../utils/auth';

const GuestLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getLoginToken();
    if (token) {
      // If user is already logged in, redirect to dashboard
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="guest-layout">
      {children}
    </div>
  );
};

export default GuestLayout;