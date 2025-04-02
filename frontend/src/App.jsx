import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeAdmin from "./pages/admin/Home";
import HomeDueno from "./pages/dueno/Home"
import SignInPage from "./pages/SignInPage";
import InvoiceListPage from "./pages/admin/InvoiceListPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";

function App() {
  const role = "dueno" // esto eventualmente se obtendra del jwt
  
  return (
    <BrowserRouter>
      <RouteScrollToTop />
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
        <Route path="/invoice-list" element={<InvoiceListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
