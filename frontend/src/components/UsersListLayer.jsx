import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import axios from "axios";

const UsersListLayer = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/users/getUsers');
      setUsuarios(response.data || []);
      setUsuariosFiltrados(response.data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (correo) => {
    try {
      await axios.delete('http://localhost:5000/users/deleteUser', { data: { correo } });
      fetchUsuarios(); // recarga después de eliminar
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  useEffect(() => {
    const filtrados = usuarios.filter((usuario) =>
      usuario.nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.rol?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      usuario.organizacion?.toLowerCase().includes(terminoBusqueda.toLowerCase())
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
          <span className="text-md fw-medium text-secondary-light mb-0">Mostrar</span>
          <form className="navbar-search">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              placeholder="Buscar usuarios..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>
        </div>
        <Link to="/agregar-usuario" className="btn btn-primary btn-sm">
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
                    <th>Organización</th>
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
                        <td>{usuario.organizacion || "No especificada"}</td>
                        <td>{usuario.rol}</td>
                        <td className="text-center">
                          <div className="d-flex align-items-center gap-10 justify-content-center">
                            <button type="button" className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle">
                              <Icon icon="majesticons:eye-line" className="icon text-xl" />
                            </button>
                            <button type="button" className="bg-success-focus bg-hover-success-200 text-success-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle">
                              <Icon icon="lucide:edit" className="menu-icon" />
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarUsuario(usuario.correo)}
                              className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                            >
                              <Icon icon="fluent:delete-24-regular" className="menu-icon" />
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
                <li className="page-item">
                  <Link to="#" className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md">
                    <Icon icon="ep:d-arrow-left" />
                  </Link>
                </li>
                {Array.from({ length: totalPaginas }, (_, idx) => (
                  <li key={idx} className="page-item">
                    <Link to="#" className={`page-link ${paginaActual === idx + 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-secondary-light'} fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}>
                      {idx + 1}
                    </Link>
                  </li>
                ))}
                <li className="page-item">
                  <Link to="#" className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px text-md">
                    <Icon icon="ep:d-arrow-right" />
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersListLayer;
