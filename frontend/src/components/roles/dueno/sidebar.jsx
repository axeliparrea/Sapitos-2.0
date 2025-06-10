import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  const [tipoLocation, setTipoLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  useEffect(() => {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("UserData="));

    let userData = null;
    if (userDataCookie) {
      const encoded = userDataCookie.split("=")[1];
      try {
        userData = JSON.parse(decodeURIComponent(encoded));
      } catch (err) {
        console.error("❌ Error al decodificar la cookie UserData:", err);
      }
    }

    const locationId = userData?.locationId;
    if (!locationId) {
      setTipoLocation(null);
      setLoading(false);
      return;
    }

    const fetchTipoLocation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/location2/getByID/${parseInt(locationId)}`,
          { withCredentials: true }
        );
        setTipoLocation(response.data.TIPO);
      } catch (error) {
        console.error("❌ Error al obtener tipo de ubicación:", error);
        setTipoLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTipoLocation();
  }, []);

  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  if (loading) return <div className="p-3">Cargando menú...</div>;
  if (!tipoLocation) return <div className="p-3">Tipo de ubicación no detectado</div>;

  return (
    <>
      <aside
        className={
          sidebarActive
            ? "sidebar active"
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <div>
          <Link to='/dashboard' className='sidebar-logo'>
            <img src='assets/images/logo.png' alt='site logo' className='light-logo' />
            <img src='assets/images/logo-light.png' alt='site logo' className='dark-logo' />
            <img src='assets/images/logo-icon.png' alt='site logo' className='logo-icon' />
          </Link>
        </div>

        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li><NavLink to='/dashboard' className='sidebar-link'><Icon icon='solar:home-smile-angle-outline' /> Estadísticas</NavLink></li>
            <li><NavLink to='/inventario' className='sidebar-link'><Icon icon='hugeicons:invoice-03' /> Inventario</NavLink></li>

            {/* Órdenes recibidas */}
            {(tipoLocation === "Almacén" || tipoLocation === "Proveedor") && (
              <li className='sidebar-item'>
                <button className='sidebar-link' onClick={() => toggleSubMenu('ordenes')}>
                  <Icon icon='mdi:inbox-arrow-down' /> Órdenes Recibidas <Icon icon='mdi:chevron-down' className='chevron' />
                </button>
                {openSubMenu === 'ordenes' && (
                  <ul className='submenu'>
                    <li><NavLink to='/ordenes-recibidas/pendiente' className='submenu-link'>Órdenes Nuevas</NavLink></li>
                    <li><NavLink to='/ordenes-recibidas/proceso' className='submenu-link'>En Proceso</NavLink></li>
                    <li><NavLink to='/ordenes-recibidas/completadas' className='submenu-link'>Completadas</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {/* Pedir producto */}
            {(tipoLocation === "Sucursal" || tipoLocation === "Almacén") && (
              <li className='sidebar-item'>
                <button className='sidebar-link' onClick={() => toggleSubMenu('pedir')}>
                  <Icon icon='mdi:cart-plus' /> Pedir Producto <Icon icon='mdi:chevron-down' className='chevron' />
                </button>
                {openSubMenu === 'pedir' && (
                  <ul className='submenu'>
                    <li><NavLink to='/pedir-producto/nuevas' className='submenu-link'>Órdenes Nuevas</NavLink></li>
                    <li><NavLink to='/pedir-producto/proceso' className='submenu-link'>En Proceso</NavLink></li>
                    <li><NavLink to='/pedir-producto/completadas' className='submenu-link'>Completadas</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {tipoLocation === "Proveedor" && (
              <li><NavLink to='/crear-producto' className='sidebar-link'>Crear producto</NavLink></li>
            )}

            <li><NavLink to='/recomendaciones-IA' className='sidebar-link'>Recomendaciones IA</NavLink></li>
            <li><NavLink to='/asistente-ia' className='sidebar-link'><Icon icon='simple-icons:openai' /> Asistente IA</NavLink></li>
          </ul>
        </div>
      </aside>

      {/* CSS interno */}
      <style>
{`
  .sidebar-item {
    display: flex;
    flex-direction: column;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    color: black;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    text-align: left;
  }

  .sidebar-link svg {
    font-size: 1.2rem;
  }

  .submenu {
    display: flex;
    flex-direction: column;
    margin-left: 30px;
  }

  .submenu-link {
    padding: 6px 10px;
    color: #ccc;
    text-decoration: none;
    font-size: 0.95rem;
  }

  .submenu-link:hover {
    color: black;
    font-weight: bold;
  }

  .chevron {
    margin-left: auto;
  }
`}
</style>

    </>
  );
};

export default Sidebar;
