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
      error => {
        // Check if error response indicates OTP is required
        if (error.response && error.response.status === 401) {
          const { requiresOtp } = error.response.data;
          
          if (requiresOtp) {
            console.log('OTP verification required, redirecting to OTP page');
            navigate('/otp');
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