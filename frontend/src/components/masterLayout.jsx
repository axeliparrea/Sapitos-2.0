import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

// Importación dinámica de headers y sidebars por rol/tipoEmpleado
const AdminNavbar = lazy(() => import("./roles/admin/navbarHeader"));
const AdminSidebar = lazy(() => import("./roles/admin/sidebar"));

const DuenoNavbar = lazy(() => import("./roles/dueno/navbarHeader"));
const DuenoSidebar = lazy(() => import("./roles/dueno/sidebar"));

const ClienteNavbar = lazy(() => import("./roles/cliente/navbarHeader"));
const ClienteSidebar = lazy(() => import("./roles/cliente/sidebar"));

const ProveedorNavbar = lazy(() => import("./roles/proveedor1/navbarHeader"));
const ProveedorSidebar = lazy(() => import("./roles/proveedor1/sidebar"));

const AlmacenNavbar = lazy(() => import("./roles/almacen/navbarHeader"));
const AlmacenSidebar = lazy(() => import("./roles/almacen/sidebar"));

const SucursalNavbar = lazy(() => import("./roles/sucursal/navbarHeader"));
const SucursalSidebar = lazy(() => import("./roles/sucursal/sidebar"));

// Mapeo de componentes
const ROLE_COMPONENTS = {
  admin: { Navbar: AdminNavbar, Sidebar: AdminSidebar },
  dueno: { Navbar: DuenoNavbar, Sidebar: DuenoSidebar },
  cliente: { Navbar: ClienteNavbar, Sidebar: ClienteSidebar },
  proveedor: { Navbar: ProveedorNavbar, Sidebar: ProveedorSidebar },
  almacen: { Navbar: AlmacenNavbar, Sidebar: AlmacenSidebar },
  sucursal: { Navbar: SucursalNavbar, Sidebar: SucursalSidebar },
};

// Rol numérico a texto
const ROLE_ID_MAP = {
  1: "admin",
  2: "dueno",
  3: "empleado", // empleados deben usar tipoEmpleado para más precisión
};

const MasterLayout = ({ children, role, tipoEmpleado }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  let roleKey = ROLE_ID_MAP[role] || "admin";

  if (roleKey === "empleado") {
    roleKey = tipoEmpleado?.toLowerCase(); // ejemplo: "proveedor", "almacen", "sucursal"
  }

  const { Navbar, Sidebar } = ROLE_COMPONENTS[roleKey] || ROLE_COMPONENTS.admin;

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");
      document.querySelectorAll(".sidebar-menu .dropdown").forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = "0px";
      });

      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;
      }
    };

    const dropdownTriggers = document.querySelectorAll(".sidebar-menu .dropdown > a");
    dropdownTriggers.forEach((trigger) =>
      trigger.addEventListener("click", handleDropdownClick)
    );

    return () => {
      dropdownTriggers.forEach((trigger) =>
        trigger.removeEventListener("click", handleDropdownClick)
      );
    };
  }, [location.pathname]);

  return (
    <Suspense fallback={<div>Loading layout...</div>}>
      <section className={mobileMenu ? "overlay active" : "overlay"}>
        <Sidebar
          sidebarActive={sidebarActive}
          mobileMenu={mobileMenu}
          mobileMenuControl={() => setMobileMenu(!mobileMenu)}
        />
        <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
          <Navbar
            sidebarActive={sidebarActive}
            sidebarControl={() => setSidebarActive(!sidebarActive)}
            mobileMenuControl={() => setMobileMenu(!mobileMenu)}
          />
          <div className="dashboard-main-body">{children}</div>
          <footer className="d-footer">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <p className="mb-0">© SAPitos</p>
              </div>
            </div>
          </footer>
        </main>
      </section>
    </Suspense>
  );
};

export default MasterLayout;
