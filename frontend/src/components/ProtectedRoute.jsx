import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthHandler';

const ProtectedRoute = ({ children, allowedRoles = [], superAdminOnly = false }) => {
  const { role, rolId, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Verificando autenticación...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (superAdminOnly && rolId !== 5) {
    console.log("Esta ruta requiere privilegios de superadmin");
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log("User role not authorized");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
