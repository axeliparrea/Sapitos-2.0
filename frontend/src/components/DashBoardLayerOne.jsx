import SalesStatisticOne from "./general/child/SalesStatisticOne";
// import TotalSubscriberOne from "./general/child/TotalSubscriberOne";
import UnitCountOne from "./general/child/UnitCountOne";
import RiskProductsOne from "./general/child/RiskProductsOne";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import getCookie from "../utils/cookies";

const DashBoardLayerOne = () => {
  const [userData, setUserData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookieData = getCookie("UserData");
        console.log("Cookie data:", cookieData);
        
        if (cookieData) {
          // Si cookieData es un string, intentar parsearlo
          const parsedData = typeof cookieData === 'string' ? JSON.parse(cookieData) : cookieData;
          console.log("Parsed user data:", parsedData);
          setUserData(parsedData);

          // Fetch location details if user has a location ID
          if (parsedData.LOCATION_ID) {
            console.log("Fetching location for ID:", parsedData.LOCATION_ID);
            const locationResponse = await fetch(`http://localhost:5000/helpers/locations/${parsedData.LOCATION_ID}`, {
              credentials: 'include'
            });
            console.log("Location response status:", locationResponse.status);
            
            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              console.log("Location data received:", locationData);
              setUserLocation(locationData);
            } else {
              const errorText = await locationResponse.text();
              console.error("Error fetching location:", errorText);
            }
          } else {
            console.log("No LOCATION_ID found in user data");
          }
        } else {
          console.log("No UserData cookie found");
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

  return (
    <>
      {/* Location Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center gap-3 border-bottom pb-3">
            {loading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : userLocation ? (
              <>
                <Icon icon="mdi:map-marker" className="text-primary fs-4" />
                <span className="text-primary fw-semibold fs-5">{userLocation.nombre}</span>
                <span className="text-secondary-light fs-6">({userLocation.organizacion || ""})</span>
              </>
            ) : (
              <div className="text-muted">
                No se encontró información de ubicación
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UnitCountOne */}
      <UnitCountOne />

      <section className='row gy-4 mt-1'>
        {/* SalesStatisticOne */}
        <SalesStatisticOne />

        {/* RiskProductsOne */}
        <RiskProductsOne />

      </section>
    </>
  );
};

export default DashBoardLayerOne;
