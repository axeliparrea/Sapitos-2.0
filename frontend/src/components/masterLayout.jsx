import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

const AdminNavbar = lazy(() => import("./roles/admin/navbarHeader"));
const AdminSidebar = lazy(() => import("./roles/admin/sidebar"));
const DuenoNavbar = lazy(() => import("./roles/dueno/navbarHeader"));
const DuenoSidebar = lazy(() => import("./roles/dueno/sidebar"));
const ClienteNavbar = lazy(() => import("./roles/cliente/navbarHeader"));
const ClienteSidebar = lazy(() => import("./roles/cliente/sidebar"));
const ProveedorNavbar = lazy(() => import("./roles/proveedor/navbarHeader"));
const ProveedorSidebar = lazy(() => import("./roles/proveedor/sidebar"));

const ROLE_COMPONENTS = {
  admin: { Navbar: AdminNavbar, Sidebar: AdminSidebar },
  dueno: { Navbar: DuenoNavbar, Sidebar: DuenoSidebar },
  cliente: { Navbar: ClienteNavbar, Sidebar: ClienteSidebar },
  proveedor: { Navbar: ProveedorNavbar, Sidebar: ProveedorSidebar }
};

const MasterLayout = ({ children, role }) => {
  let [sidebarActive, setSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  console.log(role)
  const { Navbar, Sidebar } = ROLE_COMPONENTS[role] || ROLE_COMPONENTS.admin;

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
    dropdownTriggers.forEach((trigger) => trigger.addEventListener("click", handleDropdownClick));

    return () => {
      dropdownTriggers.forEach((trigger) => trigger.removeEventListener("click", handleDropdownClick));
    };
  }, [location.pathname]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section className={mobileMenu ? "overlay active" : "overlay"}>
        <Sidebar sidebarActive={sidebarActive} mobileMenu={mobileMenu} mobileMenuControl={() => setMobileMenu(!mobileMenu)} />
        <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
          <Navbar sidebarActive={sidebarActive} sidebarControl={() => setSidebarActive(!sidebarActive)} mobileMenuControl={() => setMobileMenu(!mobileMenu)} />
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
