import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SignInPage from "./pages/SignInPage";
import HomeAdmin from "./pages/admin/Home";
import HomeDueno from "./pages/dueno/Home";
import InvoiceListPageAdmin from "./pages/admin/InvoiceListPage";
import InvoiceListPageDueno from "./pages/dueno/InvoiceListPage";

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
        console.log("Decoded JWT:", decoded);

        setRole(decoded.ROL); // Ensure it's lowercase (matching the JWT field)
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
            <Navigate to="/" />
          }
        />
        <Route 
          path="/invoice-list" 
          element={
            role === "admin" ? <InvoiceListPageAdmin /> :
            role === "dueno" ? <InvoiceListPageDueno /> :
            <Navigate to="/" />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
