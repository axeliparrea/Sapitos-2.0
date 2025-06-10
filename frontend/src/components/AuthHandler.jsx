import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AuthHandler component that intercepts API responses and handles authentication
 */
const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user needs authentication on initial load
  useEffect(() => {
    // Skip check on login and register pages
    const noCheckPaths = ['/', '/register'];
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
        // Check if error response indicates authentication is required
        if (error.response && error.response.status === 401) {
          const { requiresAuth } = error.response.data;
          
          if (requiresAuth) {
            console.log('Authentication required, redirecting to login');
            navigate('/');
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  if (isChecking) {
    return null;
  }

  return children;
};

export default AuthHandler;