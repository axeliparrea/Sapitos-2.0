import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AuthHandler component that intercepts API responses and handles OTP verification
 * redirects when needed
 */
const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user needs OTP verification on initial load
  useEffect(() => {
    // Skip OTP check on login, register, and OTP pages
    const noCheckPaths = ['/', '/register', '/otp'];
    if (noCheckPaths.includes(location.pathname)) {
      setIsChecking(false);
      return;
    }

    // Check if user has a valid session
    const checkSession = async () => {
      try {
        await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });
        
        // Session exists, continue
        setIsChecking(false);
      } catch (error) {
        // No valid session, redirect to login
        console.error("No valid session found:", error);
        navigate('/');
      }
    };

    checkSession();
  }, [location.pathname, navigate]);

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
          const { requiresOtp, message } = error.response.data;
          
          if (requiresOtp) {
            console.log('OTP verification required, redirecting to OTP page:', message);
            
            // Don't generate OTP on the OTP page itself to prevent loops
            if (location.pathname !== '/otp') {
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
                    // Store the return URL to redirect back after OTP verification
                    sessionStorage.setItem('returnUrl', location.pathname);
                  }
                  // Redirect to OTP page
                  navigate('/otp');
                })
                .catch(err => console.error("Error generating OTP:", err));
              } catch (e) {
                console.error("Failed to generate OTP:", e);
                navigate('/otp');
              }
            }
            
            // Don't reject the promise in this case
            return new Promise(() => {});
          } else if (message === 'Unauthorized' || message === 'Invalid token') {
            // Handle general authentication issues
            console.log('Authentication required, redirecting to login page');
            navigate('/');
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