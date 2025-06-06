import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";

const LocationListLayer = () => {
  const [locations, setLocations] = useState([]);
  const [filtradas, setFiltradas] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/location2", {
        withCredentials: true,
      });
      setLocations(response.data);
      setFiltradas(response.data);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
      alert("Error al obtener ubicaciones: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const resultados = locations.filter((loc) =>
      loc.NOMBRE?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      loc.TIPO?.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );
    setFiltradas(resultados);
    setPaginaActual(1);
  }, [terminoBusqueda, locations]);

  const eliminarLocation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/location2/${id}`);
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
    }
  };

  const indiceUltimo = paginaActual * porPagina;
  const indicePrimero = indiceUltimo - porPagina;
  const actuales = filtradas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(filtradas.length / porPagina);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header d-flex justify-content-between align-items-center py-16 px-24">
        <div className="d-flex align-items-center gap-3">
          <span className="text-md fw-medium text-secondary-light mb-0">Mostrar</span>
          <form className="navbar-search">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              placeholder="Buscar ubicaciones..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>
        </div>
        <Link to="/agregar-ubicacion" className="btn btn-primary btn-sm">
          <Icon icon="ic:baseline-plus" className="icon text-xl" /> Agregar Ubicación
        </Link>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center">Cargando ubicaciones...</div>
        ) : (
          <>
            <div className="table-responsive scroll-sm">
              <table className="table bordered-table sm-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actuales.length > 0 ? (
                    actuales.map((loc, index) => (
                      <tr key={loc.LOCATION_ID}>
                        <td>{indicePrimero + index + 1}</td>
                        <td>{loc.NOMBRE}</td>
                        <td>{loc.TIPO}</td>
                        <td className="text-center">
                          <div className="d-flex align-items-center gap-10 justify-content-center">
                            <button
                              type="button"
                              onClick={() => navigate(`/editar-ubicacion/${loc.LOCATION_ID}`)}
                              className="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon icon="lucide:edit" />
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarLocation(loc.LOCATION_ID)}
                              className="bg-danger-focus text-danger-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon icon="fluent:delete-24-regular" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No se encontraron ubicaciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
              <span>
                Mostrando {indicePrimero + 1} a {Math.min(indiceUltimo, filtradas.length)} de {filtradas.length} registros
              </span>
              <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                {Array.from({ length: totalPaginas }, (_, idx) => (
                  <li key={idx} className="page-item">
                    <button
                      type="button"
                      onClick={() => setPaginaActual(idx + 1)}
                      className={`page-link ${
                        paginaActual === idx + 1
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-200 text-secondary-light"
                      } fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationListLayer;
