const SucursalNavbar = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  return (
    <header className="d-header">
      <div className="d-header-left">
        <button
          onClick={sidebarControl}
          className="btn btn-sm btn-neutral"
        >
          {sidebarActive ? "Cerrar menú" : "Abrir menú"}
        </button>
      </div>
      <div className="d-header-right">
        <span>Navbar Sucursal</span>
      </div>
    </header>
  );
};

export default SucursalNavbar;
