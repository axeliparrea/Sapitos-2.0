import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

/**
 * AuthHandler component that intercepts API responses and handles authentication
 */
const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [rolId, setRolId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const cookieResponse = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (cookieResponse.ok) {
          const data = await cookieResponse.json();
          if (data.usuario && data.usuario.rol) {
            setUser(data.usuario);
            setRole(data.usuario.rol);
            setRolId(data.usuario.rol_id || null);
          } else if (data.token) {
            const decoded = jwtDecode(data.token);
            setUser(decoded);
            setRole(decoded.rol || decoded.ROL);
            setRolId(decoded.rol_id || decoded.ROL_ID || null);
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const authContextValue = {
    user,
    role,
    rolId,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;