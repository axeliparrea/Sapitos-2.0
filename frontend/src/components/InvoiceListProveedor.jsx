import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from "axios";
import Swal from "sweetalert2";
import getCookie from "../utils/cookies"; 

const InvoiceListProveedor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      
      const userData = getCookie('UserData');
      
      if (!userData || !userData.token) {
        throw new Error("Datos de autenticación no encontrados");
      }

      const locationId = userData.locationId || userData.LOCATION_ID || userData.organizacion_id;
      
      if (!locationId) {
        throw new Error("Location ID no encontrado");
      }

      const response = await axios.get(
        `${API_BASE_URL}/proveedor/pedidos/${locationId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = response.data || [];
      
      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: pedido.ID,
        solicitadoPor: pedido.SolicitadoPor,
        fechaCreacion: formatDate(pedido.FechaCreacion),
        fechaEntrega: formatDate(pedido.FechaEntrega),
        cantidad: pedido.Total,
        estado: pedido.Estado,
        // Nuevos campos
        cantidadProductos: pedido.CantidadProductos || 0,
        precioVenta: parseFloat(pedido.PrecioVenta || 0).toFixed(2),
        metodoPago: pedido.MetodoPago || 'N/A',
        descripcion: pedido.Descripcion || ''
      }));
      
      setPedidos(formattedPedidos);
      
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    let errorMessage = "No se pudieron cargar los pedidos";
    
    if (error.response?.status === 401) {
      errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      document.cookie = 'UserData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else if (error.message.includes("Location ID")) {
      errorMessage = "No se pudo identificar la ubicación del proveedor";
    }
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage
    });
    
    setPedidos([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pendiente";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[month]} ${year}`;
  };

  const getEstadoClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return 'text-success';
      case 'pendiente':
        return 'text-warning';
      case 'en reparto':
        return 'text-primary';
      case 'cancelado':
        return 'text-danger';
      default:
        return '';
    }
  };

  const pedidosFiltrados = Array.isArray(pedidos) ? pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    return pedido.solicitadoPor?.toLowerCase().includes(searchLower) || 
           pedido.id?.toString().includes(searchLower) ||
           pedido.estado?.toLowerCase().includes(searchLower);
  }) : [];

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header d-flex justify-content-between align-items-center py-16 px-24">
        <span className="text-md fw-medium mb-0">Historial de Pedidos</span>
        <div className="icon-field">
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Buscar por cliente o ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="icon">
            <Icon icon="ion:search-outline" />
          </span>
        </div>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table sm-table mb-0">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha Pedido</th>
                  <th>Fecha Entrega</th>
                  <th>Cantidad Productos</th>
                  <th>Precio Total</th>
                  <th>Método Pago</th>
                  <th>Estado</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <tr key={`pedido-${pedido.id}`}>
                      <td>{pedido.numero}</td>
                      <td>#{pedido.id}</td>
                      <td>{pedido.solicitadoPor}</td>
                      <td>{pedido.fechaCreacion}</td>
                      <td>{pedido.fechaEntrega}</td>
                      <td>{pedido.cantidadProductos}</td>
                      <td>${pedido.cantidad}</td>
                      <td>{pedido.metodoPago}</td>
                      <td className={getEstadoClass(pedido.estado)}>
                        {pedido.estado}
                      </td>
                      <td className="align-middle">
                        <button
                          onClick={() => Swal.fire({ title: `Detalles del Pedido #${pedido.id}`, text: pedido.descripcion || 'Sin descripción disponible', icon: 'info' })}
                          className="w-24-px h-24-px bg-info-light text-info-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ border: 'none' }}
                          title="Ver detalles"
                        >
                          <Icon icon="ion:information-circle-outline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      {searchTerm ? 
                        `No se encontraron pedidos que coincidan con "${searchTerm}"` : 
                        "No hay pedidos registrados"
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

export default InvoiceListProveedor;