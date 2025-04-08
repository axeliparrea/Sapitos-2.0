import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import UserMenu from "../../general/userMenu";
import getCookie from "../../../utils/cookies";

const NavbarHeader = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const cookieData = getCookie("SessionData");
    if (cookieData) {
      try {
        setUserData(JSON.parse(cookieData));
        console.log(userData)
      } catch (e) {
        console.log("x")
        console.error("Invalid JSON in SessionData cookie:", e);
      }
    }
  }, []);

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
            <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
              <Icon icon="heroicons:bars-3-solid" className="icon" />
            </button>
          </div>
        </div>

        <UserMenu
          name={userData?.NOMBRE || "Usuario"} 
          role={userData?.ROL || "Rol"} 
          profileImage="assets/images/user.png"
          onClose={() => console.log("Cerrar menú")}
        />
      </div>
    </div>
  );
};

export default NavbarHeader;
