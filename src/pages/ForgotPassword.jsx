import React, { useState, useRef } from "react";
import logo from "/logo.png";
import { Link } from "react-router-dom";
import { authAPI } from "../api";
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_CONFIG, getRecaptchaToken } from "../utils/recaptcha";

const ForgotPassword = () => {
  const recaptchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage("");
    
    if (validateForm()) {
      try {
        // Get reCAPTCHA token
        const recaptchaToken = await getRecaptchaToken(recaptchaRef);
        
        const response = await authAPI.forgotPassword({ 
          email,
          recaptcha_token: recaptchaToken 
        });
        
        if (response.success) {
          setIsSuccess(true);
          setMessage("Password reset link sent to your email. Please check your inbox.");
          // In development, you might want to show the reset URL
          console.log("Reset URL:", response.data?.reset_url);
        }
      } catch (error) {
        setIsSuccess(false);
        if (error.message.includes('reCAPTCHA')) {
          setErrors({ recaptcha: error.message });
        } else {
          if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
          } else {
            setMessage(error.response?.data?.message || "Failed to send reset link. Please try again.");
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
          <p className="text-[12px] mb-8">Enter your email to reset your password.</p>
          
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              isSuccess 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {message}
            </div>
          )}
          
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
            className={`mt-[20px] px-6 py-2 text-sm font-semibold ${
              isSubmitting ? 'bg-gray-300 text-gray-500' : 'bg-black text-white'
            }`}
          >
            {isSubmitting ? 'SENDING RESET LINK...' : 'RESET PASSWORD'}
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

export default ForgotPassword;