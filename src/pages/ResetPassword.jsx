import React, { useState, useEffect, useRef } from "react";
import logo from "/logo.png";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../api";
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_CONFIG, getRecaptchaToken } from "../utils/recaptcha";

const ResetPassword = () => {
  const recaptchaRef = useRef(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setMessage("Invalid reset link. Please request a new password reset.");
    }
  }, [token, email]);

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage("");
    
    if (!token || !email) {
      setMessage("Invalid reset link. Please request a new password reset.");
      setIsSubmitting(false);
      return;
    }
    
    if (validateForm()) {
      try {
        // Get reCAPTCHA token
        const recaptchaToken = await getRecaptchaToken(recaptchaRef);
        
        const response = await authAPI.resetPassword({
          email,
          token,
          password,
          recaptcha_token: recaptchaToken
        });
        
        if (response.success) {
          setMessage("Password reset successful! Redirecting to login...");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        if (error.message.includes('reCAPTCHA')) {
          setErrors({ recaptcha: error.message });
        } else {
          if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
          } else {
            setMessage(error.response?.data?.message || "Failed to reset password. Please try again.");
          }
        }
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col h-screen w-[300px] justify-between">
        <div></div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1">
          <div className="invert">
            <img
              src={logo}
              alt="Logo"
              height="66px"
              width="auto"
              className="mb-8"
            />
          </div>
          <p className="text-[12px] mb-8">Enter your new password.</p>
          
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              message.includes('successful') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center relative">
              <input
                className={`outline-none border-b ${errors.password ? 'border-red-500' : 'border-black'} pb-2 mb-1 text-[14px] lg:text-[16px] text-black w-full`}
                placeholder="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                className="absolute right-0 top-[calc(50%-5px)] transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[12px]">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <input
              className={`outline-none border-b ${errors.confirmPassword ? 'border-red-500' : 'border-black'} pb-2 mb-1 text-[14px] lg:text-[16px] text-black w-full`}
              placeholder="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="text-red-500 text-[12px]">{errors.confirmPassword}</p>}
          </div>
          
          {/* reCAPTCHA */}
          <div className="mb-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcHYpwqAAAAAGz_K7gK0t4J7A7Y7mP7W2dK9Dls"}
              onChange={(token) => setErrors(prev => ({ ...prev, recaptcha: null }))}
            />
            {errors.recaptcha && (
              <p className="text-red-500 text-[12px]">{errors.recaptcha}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-[20px] px-6 py-2 text-sm font-semibold ${
              isSubmitting ? 'bg-gray-300 text-gray-500' : 'bg-black text-white'
            }`}
          >
            {isSubmitting ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}
          </button>
          
          <Link to="/login" className="text-[12px] underline text-center mt-4">
            Back to Login
          </Link>
        </form>
        <div></div>
      </div>
    </div>
  );
};

export default ResetPassword;