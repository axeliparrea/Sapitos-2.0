import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";

import SignInPage from "./pages/SignInPage";
import Profile from "./components/UserPerfil";
import HomeAdmin from "./pages/admin/Home";
import InventarioAdmin from "./pages/admin/Inventario";
import ModelManagement from "./pages/admin/ModelManagement";

import HomeDueno from "./pages/dueno/Home";
import InventarioDueno from "./pages/dueno/Inventario";
import OrdenesProveedoresDueno from "./pages/dueno/OrdenesProveedores";
import OrdenesClientesDueno from "./pages/dueno/OrdenesClientes";
import RecomendacionesIADueno from "./pages/dueno/RecomendacionesIA";

import HomeCliente from "./pages/cliente/Home";
import InventarioCliente from "./pages/cliente/Inventario"

import HomeProveedor from "./pages/proveedor/Home";
import InvoiceListProveedorPage from "./pages/proveedor/InvoiceListProveedorPage";
import InvoiceProveedorPage from "./pages/proveedor/InvoiceProveedorPage";
import InvoicePreviewPage from "./pages/InvoicePreviewPage";
import Notificaciones from "./pages/admin/Notificaciones";

import Pedidos from "./pages/admin/Pedidos"

// Para usuarios admin 
import UsuariosShec from "./pages/admin/UsuariosShec";
import AddUserLayer from "./components/AddUserLayer";
import InvoiceAddLayer from "./components/InvoiceAddLayer";
import EditUserLayer from "./components/EditUser";
import Articulos from "./pages/admin/Articulos";
import OtpPage from "./pages/OtpPage";
import AuthHandler from './components/AuthHandler';
import ProtectedRoute from './components/ProtectedRoute';
import AddArticuloLayer from "./components/AddArticuloLayer";
import Location from "./pages/admin/Location";
import AddLocationLayer from "./components/AddLocationLayer";
import EditArticuloLayer from "./components/EditArticuloLayer";
import EditLocationLayer from "./components/EditarLocation";


const App = () => {
  const [role, setRole] = useState(null); // Initially null
  const [loading, setLoading] = useState(true); // Loading state
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const cookieResponse = await fetch(`${API_BASE_URL}/users/getSession`, {
          credentials: "include",
        });

        if (!cookieResponse.ok) {
          setLoading(false);
          return; // No token found, stop execution
        }

        const data = await cookieResponse.json();
        console.log("Session Data:", data);

        // Check if we have user data with role
        if (data.usuario && data.usuario.rol) {
          setRole(data.usuario.rol);
        } else if (data.token) {
          // Decode token as fallback
          const decoded = jwtDecode(data.token);
          console.log("Decoded JWT:", decoded);
          setRole(decoded.rol || decoded.ROL);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
      setLoading(false);
    };

    fetchSession();
  }, []);

  // Show a loading indicator while waiting for the role
  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>;
  }
  return (
    <>
      <BrowserRouter>
        <AuthHandler>
          <Routes>
            <Route path="/" element={<SignInPage />} />
          <Route path="/otp" element={<OtpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOtp={true}>
                {role === "admin" ? <HomeAdmin /> :
                  role === "dueno" ? <HomeDueno /> :
                  role === "cliente" ? <HomeCliente /> :
                  role === "proveedor" ? <HomeProveedor /> :
                  <Navigate to="/" />}
              </ProtectedRoute>
              }
            />
            <Route 
              path="/inventario" 
              element={
                <ProtectedRoute requireOtp={true} allowedRoles={["admin", "dueno", "cliente"]}>
                {role === "admin" ? <InventarioAdmin /> :
                  role === "dueno" ? <InventarioDueno /> :
                  role === "cliente" ? <InventarioCliente /> :
                  <Navigate to="/dashboard" />}
              </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireOtp={true}>
                <Profile />
              </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:id" 
              element={
                role ? <Profile /> : <Navigate to="/" />
              } 
            />
            
            <Route 
              path="/preview" 
              element={
                role === "admin" ? <InvoicePreviewPage /> :
                role === "dueno" ? <InvoicePreviewPage/> :
                role === "cliente" ? <InvoicePreviewPage/> :
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/ordenes-proveedores" 
              element={
                role === "dueno" ? <InvoiceProveedorPage/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/ordenes-clientes" 
              element={
                role === "dueno" ? <OrdenesClientesDueno/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/recomendaciones-IA" 
              element={
                role === "dueno" ? <RecomendacionesIADueno/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/ordenes" 
              element={
                role === "proveedor" ? <InvoiceProveedorPage/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/ordenes-aceptadas" 
              element={
                role === "proveedor" ? <InvoiceListProveedorPage aceptadas={true}/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/notificaciones" 
              element={
                role === "admin" ? <Notificaciones /> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/ordenes/:id" 
              element={
                role === "proveedor" ? <InvoiceProveedorPage/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/pedidos" 
              element={
                role === "admin" ? <Pedidos/> :
                <Navigate to="/"/>
                }
              />
            <Route 
              path="/usuarios" 
              element={
                role === "admin" ? <UsuariosShec /> :
                <Navigate to="/" />
              } 
            />
            <Route 
      path="/articulos" 
      element={
        role === "admin" ? <Articulos /> :
        <Navigate to="/" />
      }
    />
    <Route 
      path="/Location" 
      element={
        role === "admin" ? <Location /> :
        <Navigate to="/" />
      }
    />

          <Route 
            path="/agregar-usuario" 
            element={
              role === "admin" ? <AddUserLayer /> :
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/agregar-articulo"
            element={
              role === "admin" ? <AddArticuloLayer /> :
              <Navigate to="/" />
            }
          />
          <Route 
            path="/agregar-Location"
            element={
              role === "admin" ? <AddLocationLayer /> :
              <Navigate to="/" />
            }
          />
                  <Route 
            path="/editar-usuario/:userId" 
            element={
              role === "admin" ? <EditUserLayer /> :
              <Navigate to="/" />
            }
          />
          <Route 
    path="/editar-articulo/:id" 
    element={
      role === "admin" ? <EditArticuloLayer /> :
      <Navigate to="/" />
    }
  />
  <Route 
    path="/editar-Location/:id"
    element={
      role === "admin" ? <EditLocationLayer /> :
      <Navigate to="/" />
    }
  />

            <Route 
              path="/modelo-prediccion" 
              element={
                role === "admin" ? <ModelManagement /> :
                <Navigate to="/" />
              }
            />

            <Route 
              path="/crearpedido" 
              element={
                role === "admin" ? <InvoiceAddLayer /> :
                <Navigate to="/" />
              } 
            />

            <Route
              path="/detalle-pedido/:id"
              element={
                role === "admin" ? <InvoicePreviewPage /> :
                role === "dueno" ? <InvoicePreviewPage/> :
                role === "cliente" ? <InvoicePreviewPage/> :
                <Navigate to="/" />
              }
            />
          <Route path="/otp" element={<OtpPage />} />
          </Routes> 
        </AuthHandler>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
};

export default App;
