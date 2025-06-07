import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * AuthHandler component that intercepts API responses and handles OTP verification
 * redirects when needed
 */
const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set up axios interceptor for API responses
    const interceptor = axios.interceptors.response.use(
      response => {
        // If the response is successful, just return it
        return response;
      },
      error => {        // Check if error response indicates OTP is required
        if (error.response && error.response.status === 401) {
          const { requiresOtp } = error.response.data;
          
          if (requiresOtp) {
            console.log('OTP verification required, redirecting to OTP page');
            
            // Generate OTP if possible
            try {
              fetch("http://localhost:5000/api/otp/generate", {
                method: "GET",
                credentials: "include",
              })
              .then(res => res.json())
              .then(data => {
                if (data.secret) {
                  // Store secret in sessionStorage for the OTP page
                  sessionStorage.setItem('otpSecret', data.secret);
                }
                // Redirect to OTP page
                navigate('/otp');
              })
              .catch(err => console.error("Error generating OTP:", err));
            } catch (e) {
              console.error("Failed to generate OTP:", e);
              navigate('/otp');
            }
            
            // Don't reject the promise in this case
            return new Promise(() => {});
          }
        }
        
        // For other errors, reject with the error
        return Promise.reject(error);
      }
    );
    
    setIsChecking(false);
    
    // Clean up the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);
  
  return isChecking ? <div>Checking authentication...</div> : children;
};

export default AuthHandler;