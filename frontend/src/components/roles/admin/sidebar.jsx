import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import SidebarButton from "../../general/sideBarButton";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Sidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  const [userRolId, setUserRolId] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const cookieResponse = await fetch("http://localhost:5000/users/getSession", {
          credentials: "include",
        });

        if (cookieResponse.ok) {
          const data = await cookieResponse.json();
          if (data.token) {
            const decoded = jwtDecode(data.token);
            // Obtener el rol_id directamente
            if (decoded.user && decoded.user.ROL_ID) {
              setUserRolId(decoded.user.ROL_ID);
            } else if (data.rol_id) {
              setUserRolId(data.rol_id);
            } else {
              // Hacer una consulta adicional si es necesario
              const userDataResponse = await fetch(`http://localhost:5000/users/getUser/${decoded.id || decoded.USUARIO_ID}`, {
                credentials: "include",
              });
              
              if (userDataResponse.ok) {
                const userData = await userDataResponse.json();
                setUserRolId(userData.ROL_ID || userData.rol_id);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error obteniendo rol del usuario:", error);
      }
    };

    checkUserRole();
  }, []);

  const isSuperAdmin = userRolId === 5;

  return (
    <aside
      className={
        sidebarActive
          ? "sidebar active "
          : mobileMenu
          ? "sidebar sidebar-open"
          : "sidebar"
      }
    >
      {/*<button
        onClick={mobileMenuControl}
        type='button'
        className='sidebar-close-btn'
      >
        <Icon icon='radix-icons:cross-2' />
      </button> */}
      
      <div>
        <Link to='/dashboard' className='sidebar-logo'>
          <img
            src='/assets/images/logo.png'
            alt='site logo'
            className='light-logo'
          />
          <img
            src='/assets/images/logo-light.png'
            alt='site logo'
            className='dark-logo'
          />
          <img
            src='/assets/images/logo-icon.png'
            alt='site logo'
            className='logo-icon'
          />
        </Link>
      </div>      
      <div className='sidebar-menu-area'>
        <ul className='sidebar-menu' id='sidebar-menu'>
            {/* Opciones visibles para admin y superadmin */}
            <SidebarButton to='/dashboard' icon='solar:home-smile-angle-outline' label='Estadisticas' />
            <SidebarButton to='/inventario' icon='fluent:box-20-filled' label='Inventario' />
            <SidebarButton to='/pedidos' icon='hugeicons:invoice-03' label='Pedidos' />
            <SidebarButton to='/notificaciones' icon='mdi:bell-outline' label='Notificaciones' />
            <SidebarButton to='/asistente-ia' icon='simple-icons:openai' label='Asistente IA' />
            
            {/* Opciones solo visibles para el superadmin */}
            {isSuperAdmin && (
              <>
                <SidebarButton to='/usuarios' icon='solar:user-linear' label='Usuarios' />
                <SidebarButton to="/articulos" icon="mdi:package-variant-closed" label="Artículos" />
                <SidebarButton to='/location' icon='material-symbols:location-on' label='Ubicaciones' />
                <SidebarButton to='/modelo-prediccion' icon='carbon:machine-learning-model' label='Modelo IA' />
              </>
            )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;