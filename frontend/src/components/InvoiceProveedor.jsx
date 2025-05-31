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
      
      if (!token) {
        throw new Error("Token no encontrado");
      }

      console.log("Token payload:", JSON.parse(atob(token.split('.')[1])));
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const locationId = payload.locationId;
      
      if (!locationId) {
        throw new Error("Location ID no encontrado en el token");
      }

      console.log("Haciendo petición a:", `http://localhost:5000/proveedor/pedidos/${locationId}`);

      const response = await axios.get(
        `http://localhost:5000/proveedor/pedidos/${locationId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Respuesta del servidor:", response.data);
      const data = response.data || [];
      
      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: `#${pedido.id}`,
        solicitadoPor: pedido.solicitadoPor || "N/A",
        fecha: formatDate(pedido.fecha),
        cantidad: pedido.total || 0,
        estatus: pedido.estado || "Pendiente",
        organizacion: pedido.organizacion || "N/A"
      }));
      
      console.log("Pedidos formateados:", formattedPedidos);
      setPedidos(formattedPedidos);
      
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      console.error("Respuesta completa del error:", error.response);
      
      let errorMessage = "No se pudieron cargar los pedidos";
      
      if (error.response?.status === 404) {
        errorMessage = "Endpoint no encontrado. Verifica que el servidor esté configurado correctamente.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
        localStorage.removeItem('token');
      } else if (error.message.includes("Token")) {
        errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente.";
        localStorage.removeItem('token');
      } else if (error.message.includes("Location ID")) {
        errorMessage = "No se pudo identificar la ubicación del proveedor";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
      
      setPedidos([]);
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
      // Mostrar confirmación antes de proceder
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas ${nuevoEstatus === "Completado" ? "aceptar" : "rechazar"} este pedido?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: nuevoEstatus === "Completado" ? '#28a745' : '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Sí, ${nuevoEstatus === "Completado" ? "aceptar" : "rechazar"}`,
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }

      const endpoint = nuevoEstatus === "Completado" 
        ? `http://localhost:5000/proveedor/inventario/${pedidoId}/aprobar` 
        : `http://localhost:5000/proveedor/inventario/${pedidoId}/rechazar`;
      
      console.log("Actualizando pedido:", pedidoId, "a estado:", nuevoEstatus);
      console.log("Endpoint:", endpoint);
      
      const response = await axios.put(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta de actualización:", response.data);
      
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `El pedido ha sido ${nuevoEstatus === "Completado" ? "aceptado" : "rechazado"} exitosamente`
      });
      
      // Recargar la lista de pedidos
      fetchPedidos();
      
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      console.error("Respuesta completa del error:", error.response);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "No se pudo actualizar el pedido";
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    }
  };
  
  const pedidosFiltrados = Array.isArray(pedidos) ? pedidos.filter(pedido =>
    (pedido.solicitadoPor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pedido.id || "").includes(searchTerm)
  ) : [];

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
        <button 
          className="btn btn-primary btn-sm"
          onClick={fetchPedidos}
          disabled={loading}
        >
          <Icon icon='mdi:refresh' className="me-1" />
          Actualizar
        </button>
      </div>
      
      <div className='card-body'>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando pedidos...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className='table bordered-table mb-0'>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>ID</th>
                  <th>Solicitado Por</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido, idx) => (
                    <tr key={`pedido-${pedido.id}-${idx}`}>
                      <td>{pedido.numero}</td>
                      <td>{pedido.id}</td>
                      <td>{pedido.solicitadoPor}</td>
                      <td>{pedido.fecha}</td>
                      <td>${parseFloat(pedido.cantidad).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          pedido.estatus === 'Pendiente' ? 'bg-warning' :
                          pedido.estatus === 'Completado' ? 'bg-success' :
                          'bg-danger'
                        }`}>
                          {pedido.estatus}
                        </span>
                      </td>
                      <td>
                        {pedido.estatus === 'Pendiente' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm me-2" 
                              onClick={() => handleActualizarEstatus(pedido.id, "Completado")}
                            >
                              <Icon icon='mdi:check' className="me-1" />
                              Aceptar
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleActualizarEstatus(pedido.id, "Rechazado")}
                            >
                              <Icon icon='mdi:close' className="me-1" />
                              Rechazar
                            </button>
                          </>
                        )}
                        {pedido.estatus !== 'Pendiente' && (
                          <span className="text-muted">
                            {pedido.estatus === 'Completado' ? 'Aceptado' : 'Rechazado'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      {searchTerm ? 
                        `No se encontraron pedidos que coincidan con "${searchTerm}"` : 
                        "No hay pedidos pendientes"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceProveedor;