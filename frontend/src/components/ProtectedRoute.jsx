import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * ProtectedRoute component that ensures users have proper authentication
 * and required OTP verification before accessing protected routes
 */
const ProtectedRoute = ({ children, allowedRoles = [], requireOtp = true }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);
  const [otpSettings, setOtpSettings] = useState(null);
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    // First, fetch OTP settings from the server
    const fetchOtpSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/otp`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const settings = await response.json();
          setOtpSettings(settings);
        } else {
          console.log("Could not fetch OTP settings, defaulting to requireOtp=true");
          setOtpSettings({ requireOtp: true });
        }
      } catch (error) {
        console.error("Error fetching OTP settings:", error);
        setOtpSettings({ requireOtp: true });
      }
    };

    fetchOtpSettings();
  }, [API_BASE_URL]);

  useEffect(() => {
    // Wait until OTP settings are loaded
    if (otpSettings === null) return;
    
    // Check if we're in the middle of a login process
    const loginInProgress = sessionStorage.getItem('loginInProgress') === 'true';
    
    // If login is in progress, we'll consider the user authorized for this transition
    // This prevents redirects during the login -> dashboard transition
    if (loginInProgress) {
      console.log("Login in progress, bypassing auth check for smooth transition");
      sessionStorage.removeItem('loginInProgress');
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      try {
        // Get session from server
        const cookieResponse = await fetch(`${API_BASE_URL}/users/getSession`, {
          credentials: "include",
        });

        if (!cookieResponse.ok) {
          console.log("No valid session found");
          setRedirectTo("/");
          setIsLoading(false);
          return;
        }

        const data = await cookieResponse.json();
        
        if (!data.token) {
          console.log("No token found in session");
          setRedirectTo("/");
          setIsLoading(false);
          return;
        }
          // Decode the token to check authorization
        const decoded = jwtDecode(data.token);
        const userRole = decoded.rol || "";
        
        // Only verify OTP if:
        // 1. The route requires OTP (requireOtp prop is true)
        // 2. Server settings require OTP (otpSettings.requireOtp is true)
        if (requireOtp && otpSettings.requireOtp) {
          const otpVerified = decoded.otpVerified === true;
          
          if (!otpVerified) {
            console.log("OTP verification required by server settings");
            
            // Store the current location to redirect back after OTP
            sessionStorage.setItem('returnUrl', location.pathname);
            
            // Redirect to OTP verification
            setRedirectTo("/otp");
            setIsLoading(false);
            return;
          }
        }
        
        // Check role-based authorization
        const roleAuthorized = allowedRoles.length === 0 || 
                              allowedRoles.includes(userRole);
                              
        if (!roleAuthorized) {
          console.log("User role not authorized");
          setRedirectTo("/dashboard");
          setIsLoading(false);
          return;
        }
        
        // User is fully authorized
        setIsAuthorized(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error checking authentication:", error);
        setRedirectTo("/");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, requireOtp, location.pathname, otpSettings, API_BASE_URL]);

  if (isLoading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Verificando autenticación...</span>
          </div>
          <p className="mt-3">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
