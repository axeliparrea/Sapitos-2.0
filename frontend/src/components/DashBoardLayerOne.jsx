import SalesStatisticOne from "./general/child/SalesStatisticOne";
// import TotalSubscriberOne from "./general/child/TotalSubscriberOne";
import UnitCountOne from "./general/child/UnitCountOne";
import RiskProductsOne from "./general/child/RiskProductsOne";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import getCookie from "../utils/cookies";
import LocationNotAssigned from "./LocationNotAssigned";

const DashBoardLayerOne = () => {
  const [userData, setUserData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [kpiData, setKpiData] = useState({
    ventas: { total: 0, percentage_change: 0 },
    unidades: { total: 0, percentage_change: 0 },
    articulos: { total: 0, percentage_change: 0 },
    clientes: { total: 0, percentage_change: 0 },
  });

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        // Get user data to extract location ID
        const cookieData = getCookie("UserData");
        let locationId = null;
        
        if (cookieData) {
          const parsedData = typeof cookieData === 'string' ? JSON.parse(cookieData) : cookieData;
          locationId = parsedData?.LOCATION_ID || parsedData?.locationId;
        }

        // Build query parameters for location filtering
        const locationParam = locationId ? `?locationId=${locationId}` : '';

        const [
          ventasRes,
          unidadesRes,
          articulosRes,
          clientesRes,
        ] = await Promise.all([
          fetch(`http://localhost:5000/kpi/ventas${locationParam}`),
          fetch(`http://localhost:5000/kpi/unidades${locationParam}`),
          fetch(`http://localhost:5000/kpi/articulos${locationParam}`),
          fetch(`http://localhost:5000/kpi/clientes${locationParam}`),
        ]);

        const ventas = await ventasRes.json();
        const unidades = await unidadesRes.json();
        const articulos = await articulosRes.json();
        const clientes = await clientesRes.json();

        setKpiData({
          ventas,
          unidades,
          articulos,
          clientes,
        });
      } catch (error) {
        console.error("Error fetching KPI data:", error);
      }
    };
    fetchKpiData();
  }, []);

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

          // Verificar que el usuario tenga un LOCATION_ID válido
          const locationId = parsedData.LOCATION_ID || parsedData.locationId;
          console.log("Location ID encontrado:", locationId);

          // Fetch location details if user has a location ID
          if (locationId) {
            console.log("Fetching location for ID:", locationId);
            const locationResponse = await fetch(`http://localhost:5000/helpers/locations/${locationId}`, {
              credentials: 'include'
            });
            console.log("Location response status:", locationResponse.status);
            
            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              console.log("Location data received:", locationData);
              setUserLocation(locationData);

              // Fetch inventory data for the location
              const inventoryResponse = await fetch(`http://localhost:5000/api/inventory/location/${locationId}`, {
                credentials: 'include'
              });
              console.log("Inventory response status:", inventoryResponse.status);

              if (inventoryResponse.ok) {
                const inventoryData = await inventoryResponse.json();
                console.log("Inventory data received:", inventoryData);
                setInventoryData(inventoryData);
              } else {
                const errorText = await inventoryResponse.text();
                console.error("Error fetching inventory:", errorText);
                setLocationError("No se pudo cargar la información de inventario");
              }
            } else {
              const errorText = await locationResponse.text();
              console.error("Error fetching location:", errorText);
              setLocationError("No se encontró información de ubicación");
            }
          } else {
            console.log("No LOCATION_ID found in user data");
            setLocationError("Usuario sin ubicación asignada");
          }
        } else {
          console.log("No UserData cookie found");
          setLocationError("No se encontraron datos de usuario");
        }
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
        setUserData(null);
        setLocationError("Error al cargar información de usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Si el usuario no tiene ubicación asignada, mostrar el componente especial
  if (!loading && locationError === "Usuario sin ubicación asignada") {
    return <LocationNotAssigned userRole={userData?.ROL} />;
  }

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
            ) : locationError ? (
              <div className="d-flex align-items-center gap-2 text-warning">
                <Icon icon="mdi:alert-circle" />
                <span>{locationError}</span>
              </div>
            ) : (
              <div className="text-muted">
                No se encontró información de ubicación
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UnitCountOne */}
      <UnitCountOne kpiData={kpiData} />

      <section className='row gy-4 mt-1'>
        {/* SalesStatisticOne */}
        <SalesStatisticOne />

        {/* RiskProductsOne */}
        <RiskProductsOne inventoryData={inventoryData} loading={loading} error={!inventoryData && !loading ? "No se pudo cargar la información de inventario." : null} />

      </section>

      {/* Location Not Assigned Component */}
      {!loading && !userLocation && <LocationNotAssigned />}
    </>
  );
};

export default DashBoardLayerOne;
