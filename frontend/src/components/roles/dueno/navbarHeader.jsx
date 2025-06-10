import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import UserMenu from "../../general/userMenu";
import getCookie from "../../../utils/cookies";
import axios from 'axios';


const NavbarHeader = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieData = getCookie("UserData");
        let parsedData;
        if (typeof cookieData === "string") {
          parsedData = JSON.parse(cookieData);
        } else {
          parsedData = cookieData;
        }
        setUserData(parsedData);

        // Fetch location details if user has a location ID
        if (parsedData.LOCATION_ID) {
          const res = await axios.get(`http://localhost:5000/location2/getByID/${locationId}`);

          if (locationResponse.ok) {
            const locationData = await locationResponse.json();
            setUserLocation(locationData);
          }
        }
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="navbar-header" id="navbarHeader">
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

  let profileImage = "assets/images/user.png";
  if (userData?.CORREO) {
    profileImage = `http://localhost:5000/users/${encodeURIComponent(userData.CORREO)}/profileImage`;
  }

  return (
    <div className="navbar-header" id="navbarHeader">
      <div className="row align-items-center justify-content-between">
        <div className="col-auto">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
              <Icon
                icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"}
                className="icon text-2xl non-active"
              />
            </button>

            {/* Location and Organization Info */}
            <div className="d-flex align-items-center gap-2" style={{ height: "100%" }}>
              {userLocation && (
                <>
                  <Icon icon="mdi:map-marker" className="text-primary fs-4" />
                  <div className="d-flex flex-column">
                    <span className="text-primary fw-semibold">{userLocation.Nombre}</span>
                    <span className="text-secondary-light fs-6">({userData?.ORGANIZACION || ""})</span>
                  </div>
                </>
              )}
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
