import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles = [], requireOtp = true }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (!response.ok) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        
        if (!data.token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        let userRole;
        try {
          const decoded = jwtDecode(data.token);
          userRole = decoded.rol;
        } catch (error) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Verificar si el rol está permitido
        const isRoleAuthorized = allowedRoles.length === 0 || allowedRoles.includes(userRole);
        
        if (!isRoleAuthorized) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verificando autenticación...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirigir al login y guardar la ubicación intentada
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
