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
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    ventas: null,
    unidades: null,
    articulos: null,
    clientes: null,
    unidadesVendidasGraph: null,
  });

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const [
          ventasRes,
          unidadesRes,
          articulosRes,
          clientesRes,
          unidadesGraphRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/kpi/ventas"),
          fetch("http://localhost:5000/kpi/unidades"),
          fetch("http://localhost:5000/kpi/articulos"),
          fetch("http://localhost:5000/kpi/clientes"),
          fetch("http://localhost:5000/kpi/unidades-vendidas-graph"),
        ]);

        const ventas = await ventasRes.json();
        const unidades = await unidadesRes.json();
        const articulos = await articulosRes.json();
        const clientes = await clientesRes.json();
        const unidadesVendidasGraph = await unidadesGraphRes.json();

        setKpiData({
          ventas,
          unidades,
          articulos,
          clientes,
          unidadesVendidasGraph,
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

              // Fetch inventory data for the location
              const inventoryResponse = await fetch(`http://localhost:5000/inventory/location/${parsedData.LOCATION_ID}`, {
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
              }
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
      <UnitCountOne inventoryData={inventoryData} kpiData={kpiData.unidades} />

      <section className='row gy-4 mt-1'>
        {/* SalesStatisticOne */}
        <SalesStatisticOne inventoryData={inventoryData} kpiData={kpiData.ventas} graphData={kpiData.unidadesVendidasGraph} />

        {/* RiskProductsOne */}
        <RiskProductsOne inventoryData={inventoryData} loading={loading} error={!inventoryData && !loading ? "No se pudo cargar la información de inventario." : null} />

      </section>
    </>
  );
};

export default DashBoardLayerOne;
