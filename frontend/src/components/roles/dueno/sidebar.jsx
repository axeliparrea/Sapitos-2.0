import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import SidebarButton from "../../general/sideBarButton";
import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = ({ sidebarActive, mobileMenu, mobileMenuControl }) => {
  const [tipoLocation, setTipoLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("UserData="));

    let userData = null;
    if (userDataCookie) {
      const encoded = userDataCookie.split("=")[1];
      try {
        userData = JSON.parse(decodeURIComponent(encoded));
        console.log("🍪 UserData decodificado:", userData);
      } catch (err) {
        console.error("❌ Error al decodificar la cookie UserData:", err);
      }
    }

    const locationId = userData?.locationId;
    console.log("📍 locationId detectado desde cookie:", locationId);

    if (!locationId) {
      setTipoLocation(null);
      setLoading(false);
      return;
    }

    const fetchTipoLocation = async () => {
      try {
        const idParsed = parseInt(locationId);
        const response = await axios.get(
          `http://localhost:5000/location2/getByID/${idParsed}`,
          { withCredentials: true }
        );

        console.log("✅ Ubicación recibida:", response.data);
        setTipoLocation(response.data.TIPO);
      } catch (error) {
        console.error("❌ Error al obtener tipo de ubicación:", error);
        if (error.response) {
          console.error("🧾 Respuesta del servidor:", error.response.data);
        }
        setTipoLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTipoLocation();
  }, []);

  if (loading) return <div className="p-3">Cargando menú...</div>;
  if (!tipoLocation) return <div className="p-3">Tipo de ubicación no detectado</div>;

  console.log("📘 Sidebar cargado con tipoLocation:", tipoLocation);

  return (
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
          <SidebarButton to='/dashboard' icon='solar:home-smile-angle-outline' label='Estadísticas' />
          <SidebarButton to='/inventario' icon='hugeicons:invoice-03' label='Inventario' />

          {/* Órdenes recibidas */}
          {(tipoLocation === "Almacén" || tipoLocation === "Proveedor") && (
            <SidebarButton to='/ordenes-Recibidas' label='Órdenes recibidas' />
          )}

          {/* Pedir producto */}
          {(tipoLocation === "Sucursal" || tipoLocation === "Almacén") && (
            <SidebarButton to='/pedir-producto' label='Pedir producto' />
          )}

          {/* Crear producto (solo proveedor) */}
          {tipoLocation === "Proveedor" && (
            <SidebarButton to='/crear-producto' label='Crear producto' />
          )}

          <SidebarButton to='/recomendaciones-IA' label='Recomendaciones IA' />
          <SidebarButton to='/asistente-ia' icon='simple-icons:openai' label='Asistente IA' />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
