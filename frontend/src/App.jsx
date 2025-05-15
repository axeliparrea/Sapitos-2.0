import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const App = () => {
  const [role, setRole] = useState(null); // Initially null
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const cookieResponse = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (!cookieResponse.ok) {
          setLoading(false);
          return; // No token found, stop execution
        }

        const data = await cookieResponse.json();
        //console.log("Session Data:", data);

        const token = data.token;
        if (!token) {
          setLoading(false);
          return;
        }

        // Decode token
        const decoded = jwtDecode(token);
        //console.log("Decoded JWT:", decoded);
        setRole(decoded.ROL); 
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

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route
          path="/dashboard"
          element={
            role === "admin" ? <HomeAdmin /> :
            role === "dueno" ? <HomeDueno /> :
            role === "cliente" ? <HomeCliente /> :
            role === "proveedor" ? <HomeProveedor /> :
            <Navigate to="/" />
          }
        />
        <Route 
          path="/inventario" 
          element={
            role === "admin" ? <InventarioAdmin /> :
            role === "dueno" ? <InventarioDueno /> :
            role === "cliente" ? <InventarioCliente/> :
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/ordenes-proveedores" 
          element={
            role === "dueno" ? <OrdenesProveedoresDueno/> :
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
            role === "proveedor" ? <OrdenesProveedor/> :
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
          path="/agregar-usuario" 
          element={
            role === "admin" ? <AddUserLayer /> :
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
      </Routes> 
    </BrowserRouter>

  );
};

export default App;
