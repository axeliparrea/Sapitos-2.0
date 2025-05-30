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
      const token = localStorage.getItem('token');
      console.log(JSON.parse(atob(token.split('.')[1])));
      if (!token) throw new Error("Token no encontrado");
      const payload = JSON.parse(atob(token.split('.')[1]));
      const locationId = payload.locationId;
      if (!locationId) throw new Error("Location ID no encontrado en el token");
      const response = await axios.get(`http://localhost:5000/proveedor/pedidos-pendientes/${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const formattedPedidos = response.data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: `#${pedido.id}`,
        solicitadoPor: pedido.solicitadoPor,
        fecha: formatDate(pedido.fecha),
        cantidad: pedido.total,
        estatus: pedido.estado
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
    pedido.solicitadoPor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.id.includes(searchTerm)
  );

  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <span>Pedidos Pendientes</span>
          <div className='icon-field'>
            <input
              type='text'
              name='search'
              className='form-control form-control-sm w-auto'
              placeholder='Buscar por solicitante o ID'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className='icon'>
              <Icon icon='ion:search-outline' />
            </span>
          </div>
        </div>
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
                <th>Solicitado Por</th>
                <th>Fecha</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((pedido, idx) => (
                  <tr key={idx}>
                    <td>{pedido.numero}</td>
                    <td>{pedido.id}</td>
                    <td>{pedido.solicitadoPor}</td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.cantidad}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleActualizarEstatus(pedido.id, "Completado")}>Aceptar</button>
                      <button className="btn btn-danger btn-sm ms-2" onClick={() => handleActualizarEstatus(pedido.id, "Rechazado")}>Rechazar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No hay pedidos pendientes</td>
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
