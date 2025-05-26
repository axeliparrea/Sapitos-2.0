const SucursalSidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  return (
    <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
      <nav className="sidebar-menu">
        <ul>
          <li><a href="/dashboard">Inicio</a></li>
          <li><a href="/ordenes">Órdenes</a></li>
          <li><a href="/inventario">Inventario</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default SucursalSidebar;
