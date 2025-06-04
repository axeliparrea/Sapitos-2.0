import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";

const UsersListLayer = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Obtener usuarios
      const usuariosResponse = await axios.get('http://localhost:5000/users/getUsers', {
        withCredentials: true
      });

      // Obtener roles
      const rolesResponse = await axios.get('http://localhost:5000/rol/getRoles');
      const rolesMap = {};
      rolesResponse.data.forEach((r) => {
        rolesMap[r.ROL_ID] = r.NOMBRE;
      });

      // Obtener ubicaciones
      const locationsResponse = await axios.get('http://localhost:5000/location2');
      const locationsMap = {};
      locationsResponse.data.forEach((l) => {
        locationsMap[l.LOCATION_ID] = l.NOMBRE;
      });

      // Enlazar nombre de rol y nombre de ubicación a cada usuario
      const usuariosConDatos = usuariosResponse.data.map(usuario => ({
        ...usuario,
        rol: rolesMap[usuario.rolID] || "Sin rol",
        locationNombre: locationsMap[usuario.locationId] || "Sin ubicación"
      }));

      setUsuarios(usuariosConDatos);
      setUsuariosFiltrados(usuariosConDatos);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("No autorizado. Por favor inicia sesión como administrador o dueño.");
        window.location.href = "/";
      } else {
        console.error("Error al obtener usuarios:", error);
        alert("Error al obtener usuarios: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const eliminarUsuario = async (correo) => {
    try {
      await axios.delete('http://localhost:5000/users/deleteUser', { data: { correo } });
      fetchAllData();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  useEffect(() => {
    const filtrados = usuarios.filter((usuario) =>
      usuario.nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.rol?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.locationNombre?.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );
    setUsuariosFiltrados(filtrados);
    setPaginaActual(1);
  }, [terminoBusqueda, usuarios]);

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosActuales = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header d-flex justify-content-between align-items-center py-16 px-24">
        <div className="d-flex align-items-center gap-3">
          <span>Usuarios</span>
          <div className="icon-field">
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Buscar usuarios..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            <span className="icon">
              <Icon icon="ion:search-outline" />
            </span>
          </div>
        </div>
        <Link to="/agregar-usuario" id="agregarUsuarioBtn" className="btn btn-primary btn-sm">
          <Icon icon="ic:baseline-plus" className="icon text-xl" /> Agregar Usuario
        </Link>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center">Cargando usuarios...</div>
        ) : (
          <>
            <div className="table-responsive scroll-sm">
              <table className="table bordered-table sm-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Ubicación</th>
                    <th>Rol</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosActuales.length > 0 ? (
                    usuariosActuales.map((usuario, index) => (
                      <tr key={usuario.correo}>
                        <td>{indicePrimerUsuario + index + 1}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.locationNombre}</td>
                        <td>{usuario.rol}</td>
                        <td className="text-center">
                          <div className="d-flex align-items-center gap-10 justify-content-center">
                            <button
                              type="button"
                              onClick={() => navigate(`/editar-usuario/${usuario.correo}`)}
                              className="w-24-px h-24-px me-4 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ border: 'none' }}
                              title="Editar Usuario"
                            >
                              <Icon icon="lucide:edit" />
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarUsuario(usuario.correo)}
                              className="w-24-px h-24-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ border: 'none' }}
                              title="Eliminar Usuario"
                            >
                              <Icon icon="fluent:delete-24-regular" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
              <span>Mostrando {indicePrimerUsuario + 1} a {Math.min(indiceUltimoUsuario, usuariosFiltrados.length)} de {usuariosFiltrados.length} registros</span>
              <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                {Array.from({ length: totalPaginas }, (_, idx) => (
                  <li key={idx} className="page-item">
                    <button
                      id={`paginacion-${idx + 1}`}
                      type="button"
                      onClick={() => cambiarPagina(idx + 1)}
                      className={`page-link ${paginaActual === idx + 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-secondary-light'} fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}
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

export default UsersListLayer;
