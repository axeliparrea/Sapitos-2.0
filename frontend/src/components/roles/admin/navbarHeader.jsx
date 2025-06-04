import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import UserMenu from "../../general/userMenu";

const NavbarHeader = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/getSession', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Sesión obtenida:", data);
          
          // Transformar los datos para que coincidan con el formato esperado
          const formattedUserData = {
            id: data.usuario.id,
            NOMBRE: data.usuario.nombre,
            ROL: data.usuario.rol, // solo 'rol' minúsculas
            CORREO: data.usuario.correo,
            USERNAME: data.usuario.username,
            ORGANIZACION: data.usuario.organizacion || '', // Si tienes organización en el backend
            token: data.token
          };
          
          setUserData(formattedUserData);
        } else {
          console.log("No hay sesión válida");
          setUserData(null);
          // Opcional: redirigir al login si no hay sesión
          // window.location.href = '/login';
        }
      } catch (error) {
        console.error("Error obteniendo sesión:", error);
        setUserData(null);
      } finally {
        setLoading(false);
    const fetchUserSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/getSession', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Sesión obtenida:", data);
          
          // Transformar los datos para que coincidan con el formato esperado
          const formattedUserData = {
            id: data.usuario.id,
            NOMBRE: data.usuario.nombre,
            ROL: data.usuario.rol, // solo 'rol' minúsculas
            CORREO: data.usuario.correo,
            USERNAME: data.usuario.username,
            ORGANIZACION: data.usuario.organizacion || '', // Si tienes organización en el backend
            token: data.token
          };
          
          setUserData(formattedUserData);
        } else {
          console.log("No hay sesión válida");
          setUserData(null);
          // Opcional: redirigir al login si no hay sesión
          // window.location.href = '/login';
        }
      } catch (error) {
        console.error("Error obteniendo sesión:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
    };

    fetchUserSession();
  }, []);

  // Mostrar loading mientras se obtiene la sesión
  if (loading) {
    return (
      <div className="navbar-header">
        <div className="row align-items-center justify-content-between">
          <div className="col-auto">
            <div className="d-flex flex-wrap align-items-center gap-4">
              <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
                <Icon
                  icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"}
                  className="icon text-2xl non-active"
                />
              </button>
              <div className="d-flex align-items-center" style={{ height: "100%" }}>
                <span className="fs-4 fw-semibold text-dark">Cargando...</span>
              </div>
              <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
                <Icon icon="heroicons:bars-3-solid" className="icon" />
              </button>
            </div>
          </div>
          <div>
            <span>Cargando usuario...</span>
          </div>
        </div>
      </div>
    );
  }

  // Construir la ruta de la imagen de perfil usando el correo del usuario
  let profileImage = "assets/images/user.png";
  if (userData?.CORREO) {
    // Usamos el endpoint backend para obtener la imagen de perfil
    profileImage = `${API_BASE_URL}/users/${encodeURIComponent(userData.CORREO)}/profileImage`;
  }

  return (
    <div className="navbar-header"id="navbarHeader">
      <div className="row align-items-center justify-content-between">
        {/* Botones del navbar */}
        <div className="col-auto">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
              <Icon
                icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"}
                className="icon text-2xl non-active"
              />
            </button>

            {/* Organization name */}
            <div className="d-flex align-items-center" style={{ height: "100%" }}>
              <span className="fs-4 fw-semibold text-dark">
                {userData?.ORGANIZACION || ""}
              </span>
            </div>

            <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
              <Icon icon="heroicons:bars-3-solid" className="icon" />
            </button>
          </div>
        </div>

        <UserMenu
          name={userData?.NOMBRE || "Usuario"} 
          role={userData?.ROL || "Rol"} 
          profileImage={profileImage}
          profileImage={profileImage}
          onClose={() => console.log("Cerrar menú")}
        />
      </div>
    </div>
  );
};

export default NavbarHeader;