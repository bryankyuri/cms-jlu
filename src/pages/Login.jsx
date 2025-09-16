import React, { useState, useRef } from "react";
import logo from "/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/index";
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_CONFIG, getRecaptchaToken } from "../utils/recaptcha";

const Login = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");
    setErrors({});
    
    if (validateForm()) {
      try {
        // Get reCAPTCHA token
        const recaptchaToken = await getRecaptchaToken(recaptchaRef);
        
        const response = await authAPI.login({
          email: email,
          password: password,
          recaptcha_token: recaptchaToken
        });

        if (response.success) {
          console.log("Login successful:", response);
          // Redirect to dashboard
          navigate("/");
        } else {
          setApiError(response.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.message.includes('reCAPTCHA')) {
          setErrors({ recaptcha: error.message });
        } else {
          setApiError(error.message || "Login failed. Please check your credentials and try again.");
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
          {/* API Error Display */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {apiError}
            </div>
          )}
          
          <div className="invert">
            <img
              src={logo}
              alt="Logo"
              height="66px"
              width="auto"
              className="mb-16"
            />
          </div>
          <div className="mb-4">
            <input
              className={`outline-none border-b ${errors.email ? 'border-red-500' : 'border-black'} pb-2 mb-1 text-[14px] lg:text-[16px] text-black w-full`}
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
            />
            {errors.email && <p className="text-red-500 text-[12px]">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center relative">
              <input
                className={`outline-none border-b ${errors.password ? 'border-red-500' : 'border-black'} pb-2 mb-1 text-[14px] lg:text-[16px] text-black w-full`}
                placeholder="Password"
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
          <Link to="/forgot-password" className="text-[12px] underline text-right mb-4">
            Forgot Password
          </Link>

          <div className="mb-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_CONFIG.SITE_KEY}
              theme={RECAPTCHA_CONFIG.THEME}
              size={RECAPTCHA_CONFIG.SIZE}
            />
            {errors.recaptcha && <p className="text-red-500 text-[12px] mt-1">{errors.recaptcha}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting ? 'bg-gray-300' : ' bg-black text-white'
            } text-[#787878] mt-[20px] px-6 py-2 text-sm transition-colors font-semibold`}
          >
            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
        <div></div>
      </div>
    </div>
  );
};

export default Login;
