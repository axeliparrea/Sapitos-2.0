import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtDecode from "jwt-decode";


const ProtectedRoute = ({ children, allowedRoles = [], requireOtp = true }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);
  const [otpSettings, setOtpSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOtpSettings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/settings/otp", {
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
  }, []);

  useEffect(() => {
    if (otpSettings === null) return;
    
    const checkAuth = async () => {
      try {
        const cookieResponse = await fetch("http://localhost:5000/users/getSession", {
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
        const decoded = jwtDecode(data.token);
        const userRole = decoded.rol || "";

        if (requireOtp && otpSettings.requireOtp) {
          const otpVerified = decoded.otpVerified === true;
          
          if (!otpVerified) {
            console.log("OTP verification required by server settings");
            sessionStorage.setItem('returnUrl', location.pathname);
            setRedirectTo("/otp");
            setIsLoading(false);
            return;
          }
        }
        const roleAuthorized = allowedRoles.length === 0 || 
                              allowedRoles.includes(userRole);
                              
        if (!roleAuthorized) {
          console.log("User role not authorized");
          setRedirectTo("/dashboard");
          setIsLoading(false);
          return;
        }
        
        setIsAuthorized(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error checking authentication:", error);
        setRedirectTo("/");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, requireOtp, location.pathname, otpSettings]);

  if (isLoading) {
    return <div className="loading">Verificando autenticación...</div>;
  }

  if (!isAuthorized && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
