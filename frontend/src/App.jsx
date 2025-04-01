import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageOne from "./pages/HomePageOne";
import SignInPage from "./pages/SignInPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import RouteScrollToTop from "./helper/RouteScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/dashboard" element={<HomePageOne />} />
        <Route path="/invoice-list" element={<InvoiceListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
