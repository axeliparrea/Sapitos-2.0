import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import getCookie from "../utils/cookies"; 

const InvoiceListProveedor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      
      const userData = getCookie('UserData');
      console.log("Datos del usuario:", userData);
      
      if (!userData) {
        throw new Error("Datos de usuario no encontrados");
      }
      
      if (!userData.token) {
        throw new Error("Token no encontrado");
      }

      // Obtener locationId desde userData
      const locationId = userData.locationId || userData.LOCATION_ID || userData.organizacion_id;
      
      if (!locationId) {
        throw new Error("Location ID no encontrado");
      }

      // CORREGIDO: Usar axios en lugar de fetch
      const response = await axios.get(
        `http://localhost:5000/proveedor/inventario/${locationId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Respuesta del servidor:", response.data);
      
      const data = response.data || [];
      
      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: `#${pedido.id}`,
        solicitadoPor: pedido.solicitadoPor || pedido.nombre || "N/A",
        fecha: formatDate(pedido.fecha || pedido.ultimaCompra),
        fechaEntrega: pedido.fechaEntrega ? formatDate(pedido.fechaEntrega) : '-',
        total: pedido.total || pedido.precioProveedor || 0,
        estatus: pedido.estado || "Activo"
      }));
      
      setPedidos(formattedPedidos);
      
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      
      let errorMessage = "No se pudieron cargar los pedidos";
      
      if (error.response?.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
        document.cookie = 'UserData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else if (error.message.includes("Location ID")) {
        errorMessage = "No se pudo identificar la ubicación del proveedor";
      } else if (error.message.includes("Token") || error.message.includes("usuario")) {
        errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente.";
        document.cookie = 'UserData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

  // CORREGIDO: Verificar que pedidos existe y es array antes de filtrar
  const pedidosFiltrados = Array.isArray(pedidos) ? pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    return (pedido.solicitadoPor || "").toLowerCase().includes(searchLower) || 
           (pedido.id || "").toLowerCase().includes(searchLower);
  }) : [];

  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <div className='d-flex align-items-center gap-2'>
            <span>Historial de Pedidos</span>
          </div>
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
                <th>Fecha Solicitud</th>
                <th>Fecha Entrega</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((pedido, idx) => (
                  <tr key={`pedido-${pedido.id}-${idx}`}>
                    <td>{pedido.numero}</td>
                    <td>
                      <Link 
                        to={`/pedidos/${pedido.id.replace("#", "")}`} 
                        className='text-primary-600'
                      >
                        {pedido.id}
                      </Link>
                    </td>
                    <td>
                      <h6 className='text-md mb-0 fw-medium'>
                        {pedido.solicitadoPor}
                      </h6>
                    </td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.fechaEntrega}</td>
                    <td>${pedido.total}</td>
                    <td>
                      <span className={`px-24 py-4 rounded-pill fw-medium text-sm ${
                        pedido.estatus === 'Completado' ? 'bg-success-focus text-success-main' : 
                        pedido.estatus === 'Rechazado' ? 'bg-danger-focus text-danger-main' :
                        'bg-warning-focus text-warning-main'
                      }`}>
                        {pedido.estatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    {searchTerm ? 
                      `No se encontraron pedidos que coincidan con "${searchTerm}"` : 
                      "No hay pedidos en el historial"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceListProveedor;