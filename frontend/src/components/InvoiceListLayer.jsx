import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const InvoiceListLayer = () => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/pedido");
      
      if (!Array.isArray(response.data)) {
        console.error("La respuesta no es un array:", response.data);
        const data = response.data.formatted || response.data.pedidos || [];
        
        const formattedPedidos = response.data.map((pedido, index) => ({
          numero: String(index + 1).padStart(2, '0'),
          id: `#${pedido.id}`,
          proveedor: pedido.organizacion, 
          solicitadoPor: pedido.creadoPorNombre, 
          email: pedido.creadaPor, 
          fecha: formatDate(pedido.fechaCreacion),
          cantidad: pedido.total,
          estatus: pedido.estatus
        }));
        
        setPedidos(formattedPedidos);
      } else {
        const formattedPedidos = response.data.map((pedido, index) => ({
          numero: String(index + 1).padStart(2, '0'),
          id: `#${pedido.id}`,
          proveedor: pedido.creadaPor, 
          fecha: formatDate(pedido.fechaCreacion),
          cantidad: pedido.total,
          estatus: pedido.estatus
        }));
        
        setPedidos(formattedPedidos);
      }
    } catch (error) {
      console.error("Error al obtener los pedidos:", error);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los pedidos"
        });
      } else {
        alert("Error: No se pudieron cargar los pedidos");
      }
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

  const handleDelete = async (id) => {
    const pedidoId = id.replace("#", "");
    
    try {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: "¿Estás seguro?",
          text: "No podrás revertir esta acción",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.delete(`http://localhost:5000/pedido/${pedidoId}`);
            
            Swal.fire(
              "Eliminado",
              "El pedido ha sido eliminado correctamente",
              "success"
            );
            
            fetchPedidos();
          }
        });
      } else {
        if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
          await axios.delete(`http://localhost:5000/pedido/${pedidoId}`);
          alert("El pedido ha sido eliminado correctamente");
          fetchPedidos();
        }
      }
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el pedido"
        });
      } else {
        alert("Error: No se pudo eliminar el pedido");
      }
    }
  };
  const enviarAInventario = async (pedido) => {
    if (pedido.estatus === "Completado") {
      try {

        if (typeof Swal !== 'undefined') {
          const response = await axios.put(`http://localhost:5000/pedido/${pedido.id.replace("#", "")}/inventario`);
            
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: response.data.message || `Pedido ${pedido.id} enviado al inventario principal correctamente`
          });
          fetchPedidos(); 
        } else {
          const response = await axios.put(`http://localhost:5000/pedido/${pedido.id.replace("#", "")}/inventario`);
          alert(response.data.message || `Pedido ${pedido.id} enviado al inventario principal correctamente`);
          fetchPedidos();
        }
      } catch (error) {
        console.error("Error al enviar al inventario:", error);
        let errorMessage = "No se pudo enviar el pedido al inventario";
        
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage += `: ${error.response.data.error}`;
        } else if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }


        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage
          });
        } else {
          alert(errorMessage);
        }
      }
    } else {
      const message = "Solo los pedidos con estatus \'Completado\' pueden enviarse al inventario";
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: "info", title: "Información", text: message });
      } else {
        alert(message);
      }
    }
  };

  const marcarComoCompletado = async (pedido) => {
    try {
      const pedidoId = pedido.id.replace('#', '');
      
      await axios.patch(`http://localhost:5000/pedido/${pedidoId}/estatus`, {
        estatus: "Completado"
      });
      
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Pedido completado',
          text: `El pedido ${pedido.id} ha sido marcado como completado.`
        });
      } else {
        alert(`El pedido ${pedido.id} ha sido marcado como completado.`);
      }
      fetchPedidos();
    } catch (error) {
      console.error('Error al marcar como completado:', error);
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo marcar el pedido como completado.'
        });
      } else {
        alert('No se pudo marcar el pedido como completado.');
      }
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const cumpleBusqueda = 
      pedido.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pedido.id.includes(searchTerm);
    const cumpleFiltro = filterStatus ? pedido.estatus === filterStatus : true;
    return cumpleBusqueda && cumpleFiltro;
  });
  // Pagination calculations
  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentPedidos = pedidosFiltrados.slice(idxFirst, idxLast);

  return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header d-flex justify-content-between align-items-center py-16 px-24'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <div className='d-flex align-items-center gap-2'>
            <span>Pedidos</span>
          </div>
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
          <div>
            <select 
              className="form-select form-select-sm" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Reparto">En Reparto</option>
            </select>
          </div>
        </div>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <Link to='/crearpedido' className='btn btn-sm btn-primary-600'>
            <i className='ri-add-line' /> Crear Pedido
          </Link>
        </div>
      </div>

      <div className='card-body p-24'>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className='table bordered-table sm-table mb-0'>
             <thead>
               <tr>
                 <th>Número</th>
                 <th>ID</th>
                 <th>Proveedor</th>
                 <th>Fecha</th>
                 <th>Cantidad</th>
                 <th>Estatus</th>
                 <th>Acciones</th>
               </tr>
             </thead>
             <tbody>
               {currentPedidos.length > 0 ? (
                 currentPedidos.map((pedido, idx) => (
                   <tr key={idx}>
                     <td>{pedido.numero}</td>
                     <td><Link to={`/pedido/${pedido.id.replace("#", "")}`} className='text-primary-600'>{pedido.id}</Link></td>
                     <td><h6 className='text-md mb-0 fw-medium'>{pedido.proveedor}</h6></td>
                     <td>{pedido.fecha}</td>
                     <td>{pedido.cantidad}</td>
                     <td>
                       <span className={`px-12 py-1 rounded-pill fw-medium text-xs ${
                         pedido.estatus === 'Completado' ? 'bg-success-focus text-success-main' : 
                         pedido.estatus === 'En Reparto' ? 'bg-success-focus text-success-main' : 
                         'bg-warning-focus text-warning-main'
                       }`}>
                         {pedido.estatus}
                       </span>
                     </td>
                     <td className="align-middle d-flex align-items-center">
                       {/* Botones de acción */}
                       <Link to={`/detalle-pedido/${pedido.id.replace("#", "")}`} className='w-24-px h-24-px me-4 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center' title="Ver Detalle">
                         <Icon icon='iconamoon:eye-light' />
                       </Link>
                       <button 
                         onClick={() => handleDelete(pedido.id)}
                         className='w-24-px h-24-px me-4 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                         style={{ border: 'none' }}
                       >
                         <Icon icon='mingcute:delete-2-line' />
                       </button>
                       {pedido.estatus === 'En Reparto' && (
                         <button
                           onClick={() => marcarComoCompletado(pedido)}
                           className='w-24-px h-24-px me-4 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                           style={{ border: 'none' }}
                           title="Marcar como completado"
                         >
                           <Icon icon='mdi:check-bold' />
                         </button>
                       )}
                       {pedido.estatus === 'Completado' && (
                         <button 
                           onClick={() => enviarAInventario(pedido)}
                           className='w-24-px h-24-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
                           style={{ border: 'none' }}
                           title="Enviar a inventario"
                         >
                           <Icon icon='material-symbols:inventory-2-outline' />
                         </button>
                       )}
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
          </div>
        )}
      </div>
      {/* Paginación */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24 p-24">
         <span>Mostrando {idxFirst + 1} a {Math.min(idxLast, pedidosFiltrados.length)} de {pedidosFiltrados.length} registros</span>
         <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
          <li className="page-item">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
            >
              <Icon icon="mdi:chevron-left" />
            </button>
          </li>
          {(() => {
            const groupSize = 5;
            const groupIndex = Math.floor((currentPage - 1) / groupSize);
            const startPage = groupIndex * groupSize + 1;
            const endPage = Math.min(startPage + groupSize - 1, totalPages);
            return Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
              const page = startPage + idx;
              return (
                <li key={page} className="page-item">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`page-link ${currentPage === page ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-secondary-light'} fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}
                  >
                    {page}
                  </button>
                </li>
              );
            });
          })()}
          <li className="page-item">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
            >
              <Icon icon="mdi:chevron-right" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InvoiceListLayer;