const AlmacenSidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  return (
    <aside className={`sidebar ${sidebarActive ? "active" : ""}`}>
      <nav className="sidebar-menu">
        <ul>
          <li><a href="/dashboard">Inicio</a></li>
          <li><a href="/ordenes">Órdenes recibidas</a></li>
          <li><a href="/inventario">Inventario</a></li>
        </ul>
      </nav>
    </aside>
  );
};

export default AlmacenSidebar;
