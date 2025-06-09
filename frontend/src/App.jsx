import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

// Páginas públicas
import SignInPage from "./pages/SignInPage";

// Admin
import HomeAdmin from "./pages/admin/Home";
import InventarioAdmin from "./pages/admin/Inventario";
import Pedidos from "./pages/admin/Pedidos";
import UsuariosShec from "./pages/admin/UsuariosShec";
import AddUserLayer from "./components/AddUserLayer";
import InvoiceAddLayer from "./components/InvoiceAddLayer";
import EditUserLayer from "./components/EditUser";
import Roles from "./pages/admin/Roles";
import LocationsPage from "./pages/admin/LocationsPage";
import ArticulosPage from "./pages/admin/ArticulosPage";




// Dueño
import HomeDueno from "./pages/dueno/Home";
import InventarioDueno from "./pages/dueno/Inventario";
import OrdenesProveedoresDueno from "./pages/dueno/OrdenesProveedores";
import OrdenesClientesDueno from "./pages/dueno/OrdenesClientes";
import RecomendacionesIADueno from "./pages/dueno/RecomendacionesIA";

import CrearProducto from "./components/crearProducto";

import OrdenesRecibidas from "./pages/dueno/OrdenesRecibidas";
import PedirProducto from "./pages/dueno/Pedir";



import HomeCliente from "./pages/cliente/Home";
import InventarioCliente from "./pages/cliente/Inventario"

import HomeProveedor from "./pages/proveedor/Home";
import InvoiceListProveedorPage from "./pages/proveedor/InvoiceListProveedorPage";
import InvoiceProveedorPage from "./pages/proveedor/InvoiceProveedorPage";
import InvoicePreviewPage from "./pages/InvoicePreviewPage";
import Notificaciones from "./pages/admin/Notificaciones";
import Pedidos from "./pages/admin/Pedidos"
import AiAssistantPage from "./pages/AiAssistantPage";



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

const ROLE_ID_MAP = {
  1: "admin",
  2: "dueno",
  3: "empleado",
};


const App = () => {
  const [roleId, setRoleId] = useState(null);
  const [tipoEmpleado, setTipoEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("http://localhost:5000/usuario2/getSession", {
          credentials: "include",
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        const decoded = jwtDecode(data.token);

        setRoleId(decoded.rol);
        setTipoEmpleado(decoded.tipoEmpleado || null);
      } catch (error) {
        console.error("❌ Error al obtener sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Cargando sesión...</div>;
  }

  const role = ROLE_ID_MAP[roleId] || null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<SignInPage />} />

        {/* Rutas de ADMIN */}
        {role === "admin" && (
          <>
            <Route path="/dashboard" element={<HomeAdmin />} />
            <Route path="/inventario" element={<InventarioAdmin />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/usuarios" element={<UsuariosShec />} />
            <Route path="/agregar-usuario" element={<AddUserLayer />} />
            <Route path="/editar-usuario/:userId" element={<EditUserLayer />} />
            <Route path="/crearpedido" element={<InvoiceAddLayer />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/location" element={<LocationsPage />} />
            <Route path="/articulos" element={<ArticulosPage />} />
          </>
        )}

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
  path="/crearProducto" 
  element={
    role === "dueno" ? <CrearProducto /> :
    <Navigate to="/" />
  }
/>
<Route 
  path="/ordenes-recibidas" 
  element={
    role === "dueno" ? <OrdenesRecibidas /> :
    <Navigate to="/" />
  }
/>
<Route 
  path="/pedir-producto" 
  element={
    role === "dueno" ? <PedirProducto /> :
    <Navigate to="/" />
  }
/>



        {/* Rutas de EMPLEADO genérico */}
        {role === "empleado" && (
          <>
            <Route path="/dashboard" element={<HomeEmpleado />} />
            <Route path="/inventario" element={<InventarioEmpleado />} />
            <Route path="/ordenes" element={<OrdenesEmpleado />} />
            {/* Más rutas específicas por tipoEmpleado si lo deseas */}
          </>
        )}

        {/* Redirección por defecto si no hay acceso */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
