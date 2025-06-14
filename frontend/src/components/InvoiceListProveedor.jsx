import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode"; 
import { Link } from "react-router-dom";

const InvoiceListProveedor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all"); 
  const [selectedPedido, setSelectedPedido] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []); 

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      
      const sessionResponse = await fetch("http://localhost:5000/users/getSession", {
        credentials: "include", 
      });

      if (!sessionResponse.ok) {
        throw new Error("No se pudo verificar la sesión");
      }

      const sessionData = await sessionResponse.json();
      console.log("Datos de sesión completos:", sessionData);
      
      let locationId;
      let roleId;
      let token = sessionData.token;

      if (sessionData.usuario && sessionData.usuario.locationId) {
        locationId = sessionData.usuario.locationId; 
        roleId = sessionData.usuario.ROL_ID; 
      } else if (sessionData.token) {
        try {
          const decoded = jwtDecode(sessionData.token);
          locationId = decoded.locationId;
          roleId = decoded.roleId;
        } catch (e) {
          throw new Error("Error al decodificar el token");
        }
      }

      if (!locationId) {
        throw new Error("Location ID no encontrado en la sesión");
      }

      console.log("Usando locationId:", locationId);

      const endpoint = `http://localhost:5000/proveedor/pedidos-aceptados/${locationId}`;

      console.log("Fetch endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const responseText = await response.text();
        console.log("Error response body:", responseText);
        
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
          throw new Error(`Endpoint no encontrado (${response.status}). Verifica que la ruta del servidor sea correcta.`);
        }
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Error del servidor (${response.status}): ${responseText}`);
        }
        
        throw new Error(errorData.error || `Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log("Non-JSON response:", responseText);
        throw new Error('La respuesta del servidor no es JSON válido');
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      if (!Array.isArray(data)) {
        console.log("Respuesta no es un array:", data);
        throw new Error('Formato de respuesta inesperado del servidor');
      }
      
      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: pedido.ID,
        solicitadoPor: pedido.SolicitadoPor,
        correoSolicitante: pedido.correoSolicitante, 
        fechaCreacion: formatDate(pedido.FECHACREACION),
        fechaEntrega: formatDate(pedido.FECHAESTIMADA),
        cantidad: parseFloat(pedido.TOTAL).toFixed(2),
        estado: pedido.ESTADO,
        cantidadProductos: 'N/A', 
        metodoPago: 'N/A', 
        descripcion: '' 
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
    
    if (error.message.includes("verificar la sesión")) {
      errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
      document.cookie = 'UserData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else if (error.message.includes("Location ID")) {
      errorMessage = "No se pudo identificar la ubicación del proveedor";
    } else if (error.message.includes("decodificar el token")) {
      errorMessage = "Error de autenticación. Por favor, inicia sesión nuevamente.";
    } else if (error.message.includes("Endpoint no encontrado")) {
      errorMessage = "La ruta del servidor no existe. Contacta al administrador del sistema.";
    } else if (error.message.includes("JSON válido")) {
      errorMessage = "Error en la respuesta del servidor. Intenta nuevamente.";
    } else {
      errorMessage = error.message || "Error desconocido al cargar los pedidos";
    }
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      footer: process.env.NODE_ENV === 'development' ? `Detalles técnicos: ${error.message}` : ''
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
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'completado':
        return 'px-12 py-1 rounded-pill fw-medium text-xs bg-success-focus text-success-main';
      case 'pendiente':
        return 'px-12 py-1 rounded-pill fw-medium text-xs bg-warning-focus text-warning-main';
      case 'en reparto':
        return 'px-12 py-1 rounded-pill fw-medium text-xs bg-primary-focus text-primary-main';
      default:
        return 'px-12 py-1 rounded-pill fw-medium text-xs bg-secondary-focus text-secondary-main';
    }
  };

  const pedidosFiltrados = Array.isArray(pedidos) ? pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    return pedido.solicitadoPor?.toLowerCase().includes(searchLower) || 
           pedido.id?.toString().includes(searchLower) ||
           pedido.estado?.toLowerCase().includes(searchLower);
  }) : [];

  const showDetails = (pedido) => {
    setSelectedPedido(pedido);
    Swal.fire({
      title: `Detalles del Pedido #${pedido.id}`,
      html: `<p><strong>Cliente:</strong> ${pedido.correoSolicitante}</p>
             <p><strong>Fecha Pedido:</strong> ${pedido.fechaCreacion}</p>
             <p><strong>Fecha Entrega:</strong> ${pedido.fechaEntrega}</p>
             <p><strong>Estado:</strong> ${pedido.estado}</p>
             <p><strong>Descripción:</strong> ${pedido.descripcion || "Sin descripción disponible"}</p>`,
      icon: "info",
    });
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header d-flex justify-content-between align-items-center py-16 px-24">
        <div className="d-flex align-items-center">
          <span className="text-md fw-medium mb-0 me-3">Pedidos Aceptados/Enviados</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="icon-field">
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Buscar por cliente o ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="w-32-px h-32-px bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
            onClick={fetchPedidos}
            disabled={loading}
            style={{ border: 'none' }}
            title="Actualizar"
          >
            <Icon icon='mdi:refresh' width="20" height="20" />
          </button>
        </div>
      </div>

      <div className="card-body p-24">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando pedidos...</p>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? (
                  pedidosFiltrados.map((pedido) => (
                    <tr key={`pedido-${pedido.id}`}>
                      <td>{pedido.numero}</td>
                      <td>#{pedido.id}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-medium">{pedido.solicitadoPor}</span>
                          {pedido.correoSolicitante && (
                            <small className="text-muted">{pedido.correoSolicitante}</small>
                          )}
                        </div>
                      </td>
                      <td>{pedido.fechaCreacion}</td>
                      <td>{pedido.fechaEntrega}</td>
                      <td>{pedido.cantidadProductos}</td>
                      <td className="fw-medium">${pedido.cantidad}</td>
                      <td>{pedido.metodoPago}</td>
                      <td>
                        <span className={`px-12 py-1 rounded-pill fw-medium text-xs ${
                          pedido.estado === 'Completado' ? 'bg-success-focus text-success-main' : 
                          pedido.estado === 'En Reparto' ? 'bg-primary-focus text-primary-main' :
                          pedido.estado === 'Aprobado' ? 'bg-info-focus text-info-main' :
                          pedido.estado === 'Rechazado' ? 'bg-danger-focus text-danger-main' :
                          'bg-warning-focus text-warning-main'
                        }`}>
                        {pedido.estado}
                        </span>
                      </td>
                      <td className="align-middle">
                        <button
                          onClick={() => showDetails(pedido)}
                          className='w-24-px h-24-px me-4 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'
                          style={{ border: 'none' }}
                          title="Ver detalles"
                        >
                          <Icon icon='iconamoon:eye-light' width="24" height="24" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center gap-2">
                      {searchTerm ? 
                        `No se encontraron pedidos que coincidan con "${searchTerm}"` : 
                        "No hay pedidos aceptados/enviados registrados"
                      }
                      </div>
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