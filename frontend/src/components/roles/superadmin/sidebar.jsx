import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import SidebarButton from "../../general/sideBarButton";

const Sidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  // SuperAdmin siempre tiene acceso completo, no necesita comprobar rol_id
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
            {/* Opciones para SuperAdmin - Acceso completo */}
            <SidebarButton to='/dashboard' icon='solar:home-smile-angle-outline' label='Estadisticas' />
            <SidebarButton to='/inventario' icon='fluent:box-20-filled' label='Inventario' />
            <SidebarButton to='/pedidos' icon='hugeicons:invoice-03' label='Pedidos' />
            <SidebarButton to='/notificaciones' icon='mdi:bell-outline' label='Notificaciones' />
            <SidebarButton to='/usuarios' icon='solar:user-linear' label='Usuarios' />
            <SidebarButton to="/articulos" icon="mdi:package-variant-closed" label="Artículos" />
            <SidebarButton to='/location' icon='material-symbols:location-on' label='Ubicaciones' />
            <SidebarButton to='/modelo-prediccion' icon='carbon:machine-learning-model' label='Modelo IA' />
            <SidebarButton to='/asistente-ia' icon='simple-icons:openai' label='Asistente IA' />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 