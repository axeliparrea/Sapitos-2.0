import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import UserMenu from "../../general/userMenu";
import getCookie from "../../../utils/cookies";

const NavbarHeader = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  const [userData, setUserData] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    const cookieData = getCookie("UserData");
    if (cookieData) {
      try {
        setUserData(cookieData);
        console.log(cookieData) 
        //console.log(cookieData.NOMBRE) 
      } catch (e) {
        console.log("x")
        console.error("Invalid JSON in SessionData cookie:", e);
      }
    }
  }, []);

  // Construir la ruta de la imagen de perfil usando el correo del usuario
  let profileImage = "assets/images/user.png";
  if (userData?.CORREO) {
    profileImage = `${API_BASE_URL}/users/${encodeURIComponent(userData.CORREO)}/profileImage`;
  }

  return (
    <div className="navbar-header">
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
          onClose={() => console.log("Cerrar menú")}
        />
      </div>
    </div>
  );
};

export default NavbarHeader;
