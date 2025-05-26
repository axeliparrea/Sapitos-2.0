const AlmacenNavbar = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
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
        <span>Navbar Almacén</span>
      </div>
    </header>
  );
};

export default AlmacenNavbar;
