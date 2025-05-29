import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const InvoiceListProveedor = ({ aceptadas }) => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const endpoint = aceptadas ? 'accepted' : 'pending';
      const response = await axios.get(`http://localhost:5000/orders/${endpoint}`, {
        withCredentials: true
      });
      
      if (!Array.isArray(response.data)) {
        console.error("La respuesta no es un array:", response.data);
        const data = response.data.formatted || response.data.pedidos || [];
        
        const formattedPedidos = data.map((pedido, index) => ({
          numero: String(index + 1).padStart(2, '0'),
          id: `#${pedido._id}`,
          cliente: pedido.clientName,
          fecha: formatDate(pedido.date),
          total: pedido.total,
          estatus: pedido.status
        }));
        
        setPedidos(formattedPedidos);
      } else {
        const formattedPedidos = response.data.map((pedido, index) => ({
          numero: String(index + 1).padStart(2, '0'),
          id: `#${pedido._id}`,
          cliente: pedido.clientName,
          fecha: formatDate(pedido.date),
          total: pedido.total,
          estatus: pedido.status
        }));
        
        setPedidos(formattedPedidos);
      }
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

  const pedidosFiltrados = pedidos.filter(pedido => {
    return pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
           pedido.id.includes(searchTerm);
  });

  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <div className='d-flex align-items-center gap-2'>
            <span>{aceptadas ? 'Órdenes Aceptadas' : 'Órdenes Pendientes'}</span>
          </div>
          <div className='icon-field'>
            <input
              type='text'
              name='search'
              className='form-control form-control-sm w-auto'
              placeholder='Buscar por cliente o ID'
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
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((pedido, idx) => (
                  <tr key={idx}>
                    <td>{pedido.numero}</td>
                    <td><Link to={`/ordenes/${pedido.id.replace("#", "")}`} className='text-primary-600'>{pedido.id}</Link></td>
                    <td><h6 className='text-md mb-0 fw-medium'>{pedido.cliente}</h6></td>
                    <td>{pedido.fecha}</td>
                    <td>${pedido.total}</td>
                    <td>
                      <span className={`px-24 py-4 rounded-pill fw-medium text-sm ${
                        pedido.estatus === 'Aceptado' ? 'bg-success-focus text-success-main' : 
                        'bg-warning-focus text-warning-main'
                      }`}>
                        {pedido.estatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No hay órdenes {aceptadas ? 'aceptadas' : 'pendientes'} disponibles
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