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
        
        const formattedPedidos = data.map((pedido, index) => ({
          numero: String(index + 1).padStart(2, '0'),
          id: `#${pedido.id}`,
          proveedor: pedido.creadaPor,
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
        await axios.post("/inventario/agregar", {
          proveedor: pedido.proveedor,
          cantidad: pedido.cantidad,
          fechaRecepcion: new Date().toISOString(),
          pedidoId: pedido.id.replace("#", "")
        });
        
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: `Pedido ${pedido.id} enviado al inventario correctamente`
          });
        } else {
          alert(`Pedido ${pedido.id} enviado al inventario correctamente`);
        }
      } catch (error) {
        console.error("Error al enviar al inventario:", error);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo enviar el pedido al inventario"
          });
        } else {
          alert("Error: No se pudo enviar el pedido al inventario");
        }
      }
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "warning",
          title: "Acción no permitida",
          text: "Solo los pedidos con estatus 'Completado' pueden enviarse al inventario"
        });
      } else {
        alert("Solo los pedidos con estatus 'Completado' pueden enviarse al inventario");
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

  return (
    <div className='card'>
      <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
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
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? (
                pedidosFiltrados.map((pedido, idx) => (
                  <tr key={idx}>
                    <td>{pedido.numero}</td>
                    <td><Link to={`/pedido/${pedido.id.replace("#", "")}`} className='text-primary-600'>{pedido.id}</Link></td>
                    <td><h6 className='text-md mb-0 fw-medium'>{pedido.proveedor}</h6></td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.cantidad}</td>
                    <td>
                      <span className={`px-24 py-4 rounded-pill fw-medium text-sm ${
                        pedido.estatus === 'Completado' ? 'bg-success-focus text-success-main' : 
                        pedido.estatus === 'En Reparto' ? 'bg-success-focus text-success-main' : 
                        'bg-warning-focus text-warning-main'
                      }`}>
                        {pedido.estatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/pedido/${pedido.id.replace("#", "")}`} className='w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center'>
                        <Icon icon='iconamoon:eye-light' />
                      </Link>
                      <button 
                        onClick={() => handleDelete(pedido.id)}
                        className='w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center'
                        style={{ border: 'none' }}
                      >
                        <Icon icon='mingcute:delete-2-line' />
                      </button>
                      {pedido.estatus === 'Completado' && (
                        <button 
                          onClick={() => enviarAInventario(pedido)}
                          className='w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center'
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
        )}
      </div>
    </div>
  );
};

export default InvoiceListLayer;