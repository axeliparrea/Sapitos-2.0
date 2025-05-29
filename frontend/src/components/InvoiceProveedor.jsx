import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const InvoiceProveedor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/pedido");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.formatted || response.data.pedidos || [];

      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: `#${pedido.id}`,
        proveedor: pedido.creadaPor,
        fecha: formatDate(pedido.fechaCreacion),
        cantidad: pedido.total
      }));

      setPedidos(formattedPedidos);
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pedidos"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[month]} ${year}`;
  };

  const handleActualizarEstatus = async (id, nuevoEstatus) => {
    const pedidoId = id.replace("#", "");
    try {
      await axios.put(`http://localhost:5000/pedido/${pedidoId}`, {
        estatus: nuevoEstatus
      });
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `El pedido ha sido ${nuevoEstatus === "Completado" ? "aceptado" : "rechazado"}`
      });
      fetchPedidos();
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el pedido"
      });
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido =>
    pedido.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.id.includes(searchTerm)
  );

  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <span>Pedidos</span>
          <div className='icon-field'>
            <input
              type='text'
              name='search'
              className='form-control form-control-sm w-auto'
              placeholder='Buscar'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className='icon'>
              <Icon icon='ion:search-outline' />
            </span>
          </div>
        </div>
        <Link to='/crearpedido' className='btn btn-sm btn-primary-600'>
          <i className='ri-add-line' /> Crear Pedido
        </Link>
      </div>

      <div className='card-body'>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <table className='table bordered-table mb-0'>
            <thead>
              <tr>
                <th>Número</th>
                <th>ID</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Ver</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((pedido, idx) => (
                  <tr key={idx}>
                    <td>{pedido.numero}</td>
                    <td>
                      <Link to={`/pedido/${pedido.id.replace("#", "")}`} className='text-primary-600'>
                        {pedido.id}
                      </Link>
                    </td>
                    <td><h6 className='text-md mb-0 fw-medium'>{pedido.proveedor}</h6></td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.cantidad}</td>
                    <td>
                      <Link
                        to={`/pedido/${pedido.id.replace("#", "")}`}
                        className='w-32-px h-32-px bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                      >
                        <Icon icon='iconamoon:eye-light' />
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className='btn btn-sm btn-success'
                          title="Aceptar"
                          onClick={() => handleActualizarEstatus(pedido.id, "Completado")}
                        >
                          Aceptar
                        </button>
                        <button
                          className='btn btn-sm btn-danger'
                          title="Rechazar"
                          onClick={() => handleActualizarEstatus(pedido.id, "Rechazado")}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">No se encontraron pedidos</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceProveedor;
