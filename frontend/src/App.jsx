import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import AiAssistantPage from "./pages/AiAssistantPage";
import VistaDetallePedidoAdmin from "./pages/admin/VistaDetallePedido";

// Para usuarios admin 
import UsuariosShec from "./pages/admin/UsuariosShec";
import AddUserLayer from "./components/AddUserLayer";
import InvoiceAddLayer from "./components/InvoiceAddLayer";
import EditUserLayer from "./components/EditUser";
import Articulos from "./pages/admin/Articulos";
import AuthProvider, { useAuth } from './components/AuthHandler';
import ProtectedRoute from './components/ProtectedRoute';
import AddArticuloLayer from "./components/AddArticuloLayer";
import Location from "./pages/admin/Location";
import AddLocationLayer from "./components/AddLocationLayer";
import EditArticuloLayer from "./components/EditArticuloLayer";
import EditLocationLayer from "./components/EditarLocation";

// Para SuperAdmin
import HomeSuperAdmin from "./pages/superadmin/Home";
import InventarioSuperAdmin from "./pages/superadmin/Inventario";
import NotificacionesSuperAdmin from "./pages/superadmin/Notificaciones";
import PedidosSuperAdmin from "./pages/superadmin/Pedidos";
import UsuariosShecSuperAdmin from "./pages/superadmin/UsuariosShec";
import ArticulosSuperAdmin from "./pages/superadmin/Articulos";
import LocationSuperAdmin from "./pages/superadmin/Location";
import ModelManagementSuperAdmin from "./pages/superadmin/ModelManagement";
import VistaDetallePedidoSuperAdmin from "./pages/superadmin/VistaDetallePedido";


const AppContent = () => {
  const { role, rolId, loading } = useAuth();

  // Verificar si el usuario es superadmin
  const isSuperAdmin = rolId === 5;

  // Show a loading indicator while waiting for the role
  if (loading) {
    console.log("Loading from App content...");
    return <div>Loading...</div>;
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOtp={true}>
            {role === "admin" ? <HomeAdmin /> :
              role === "SuperAdmin" ? <HomeSuperAdmin /> :
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
            <ProtectedRoute allowedRoles={["admin", "cliente", "SuperAdmin"]} requireOtp={true}>
            {role === "admin" ? <InventarioAdmin /> :
              role === "SuperAdmin" ? <InventarioSuperAdmin /> :
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
            <ProtectedRoute allowedRoles={["admin", "SuperAdmin", "cliente"]} requireOtp={true}>
              {role === "admin" ? <InvoicePreviewPage /> :
              role === "SuperAdmin" ? <InvoicePreviewPage /> :
              role === "cliente" ? <InvoicePreviewPage/> :
              <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ordenes-proveedores" 
          element={
            <ProtectedRoute allowedRoles={["dueno"]} requireOtp={true}>
              <Navigate to="/dashboard" />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ordenes-clientes" 
          element={
            <ProtectedRoute allowedRoles={["dueno"]} requireOtp={true}>
              <Navigate to="/dashboard" />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/recomendaciones-IA" 
          element={
            <ProtectedRoute allowedRoles={["dueno"]} requireOtp={true}>
              <Navigate to="/dashboard" />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ordenes" 
          element={
            <ProtectedRoute allowedRoles={["proveedor"]} requireOtp={true}>
              {role === "proveedor" ? <InvoiceProveedorPage/> :
              <Navigate to="/"/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ordenes-aceptadas" 
          element={
            <ProtectedRoute allowedRoles={["proveedor"]} requireOtp={true}>
              {role === "proveedor" ? <InvoiceListProveedorPage aceptadas={true}/> :
              <Navigate to="/"/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/notificaciones" 
          element={
            <ProtectedRoute allowedRoles={["admin", "SuperAdmin"]} requireOtp={true}>
              {role === "admin" ? <Notificaciones /> :
               role === "SuperAdmin" ? <NotificacionesSuperAdmin /> :
              <Navigate to="/"/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/ordenes/:id" 
          element={
            <ProtectedRoute allowedRoles={["proveedor"]} requireOtp={true}>
              {role === "proveedor" ? <InvoiceProveedorPage/> :
              <Navigate to="/"/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/pedidos" 
          element={
            <ProtectedRoute allowedRoles={["admin", "SuperAdmin"]} requireOtp={true}>
              {role === "admin" ? <Pedidos/> :
               role === "SuperAdmin" ? <PedidosSuperAdmin/> :
              <Navigate to="/"/>}
            </ProtectedRoute>
          }
        />
        {/* Rutas exclusivas para superadmin */}
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute superAdminOnly={true} requireOtp={true}>
              {isSuperAdmin ? <UsuariosShecSuperAdmin /> :
              <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/articulos" 
          element={
            <ProtectedRoute superAdminOnly={true} requireOtp={true}>
              {isSuperAdmin ? <ArticulosSuperAdmin /> :
              <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/location" 
          element={
            <ProtectedRoute superAdminOnly={true} requireOtp={true}>
              {isSuperAdmin ? <LocationSuperAdmin /> :
              <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <ProtectedRoute requireOtp={true}>
              <AiAssistantPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/agregar-usuario" 
          element={
            isSuperAdmin ? <AddUserLayer /> :
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/agregar-articulo"
          element={
            isSuperAdmin ? <AddArticuloLayer /> :
            <Navigate to="/dashboard" />
          }
        />
        <Route 
          path="/agregar-Location"
          element={
            isSuperAdmin ? <AddLocationLayer /> :
            <Navigate to="/dashboard" />
          }
        />
        <Route 
          path="/editar-usuario/:userId" 
          element={
            isSuperAdmin ? <EditUserLayer /> :
            <Navigate to="/dashboard" />
          }
        />
        <Route 
          path="/editar-articulo/:id" 
          element={
            isSuperAdmin ? <EditArticuloLayer /> :
            <Navigate to="/dashboard" />
          }
        />
        <Route 
          path="/editar-Location/:id"
          element={
            isSuperAdmin ? <EditLocationLayer /> :
            <Navigate to="/dashboard" />
          }
        />

        <Route 
          path="/modelo-prediccion" 
          element={
            <ProtectedRoute superAdminOnly={true}>
              {isSuperAdmin ? <ModelManagementSuperAdmin /> :
              <Navigate to="/dashboard" />}
            </ProtectedRoute>
          }
        />

        <Route 
          path="/asistente-ia" 
          element={
            <ProtectedRoute allowedRoles={["admin", "SuperAdmin", "dueno", "cliente", "proveedor"]}>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/crearpedido" 
          element={
            role === "admin" || role === "SuperAdmin" ? <InvoiceAddLayer /> :
            <Navigate to="/" />
          } 
        />

        <Route
          path="/detalle-pedido/:id"
          element={
            role === "admin" ? <VistaDetallePedidoAdmin /> :
            role === "SuperAdmin" ? <VistaDetallePedidoSuperAdmin /> :
            role === "cliente" ? <InvoicePreviewPage/> :
            <Navigate to="/dashboard" />
          }
        />
      </Routes> 
      <ToastContainer />
    </>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
