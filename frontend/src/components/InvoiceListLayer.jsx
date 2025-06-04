import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Button, Form, Badge } from 'react-bootstrap';

const InvoiceListLayer = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");  const [filters, setFilters] = useState({
    proveedor: '',
    estatus: '',
    fechaInicio: '',
    fechaFin: '',
    cantidadMin: '',
    cantidadMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);  const [filterOptions, setFilterOptions] = useState({
    proveedores: [],
    estatuses: ["Completado", "Pendiente", "En Reparto"]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/pedido");
      const data = Array.isArray(response.data) ? response.data : (response.data.formatted || response.data.pedidos || []);
      const formattedPedidos = data.map((pedido, index) => ({
        numero: String(index + 1).padStart(2, '0'),
        id: `#${pedido.id}`,
        proveedor: pedido.organizacion || pedido.creadaPor || '',
        solicitadoPor: pedido.creadoPorNombre || '',
        email: pedido.creadaPor || '',
        fecha: formatDate(pedido.fechaCreacion),
        cantidad: pedido.total,
        estatus: pedido.estatus
      }));
      setPedidos(formattedPedidos);
      // Extraer opciones únicas para filtros
      setFilterOptions(prev => ({
        ...prev,
        proveedores: [...new Set(formattedPedidos.map(p => p.proveedor).filter(Boolean))]
      }));
    } catch (error) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los pedidos" });
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

  // Función para manejar cambios en filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset pagination when filtering
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      proveedor: '',
      estatus: '',
      fechaInicio: '',
      fechaFin: '',
      cantidadMin: '',
      cantidadMax: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Función para obtener valores únicos para filtros
  const getUniqueValues = (field) => {
    const values = pedidos.map(item => item[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro de búsqueda general
    const matchesSearch = 
      pedido.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pedido.id.includes(searchTerm) ||
      pedido.solicitadoPor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtros por columna
    const matchesProveedor = !filters.proveedor || pedido.proveedor === filters.proveedor;
    const matchesEstatus = !filters.estatus || pedido.estatus === filters.estatus;
    
    // Filtros por fecha (si se implementan)
    let matchesFecha = true;
    if (filters.fechaInicio || filters.fechaFin) {
      const pedidoDate = new Date(pedido.fecha);
      if (filters.fechaInicio) {
        matchesFecha = matchesFecha && pedidoDate >= new Date(filters.fechaInicio);
      }
      if (filters.fechaFin) {
        matchesFecha = matchesFecha && pedidoDate <= new Date(filters.fechaFin);
      }
    }
    
    // Filtros por cantidad
    const cantidad = parseFloat(pedido.cantidad || 0);
    const matchesCantidadMin = !filters.cantidadMin || cantidad >= parseFloat(filters.cantidadMin);
    const matchesCantidadMax = !filters.cantidadMax || cantidad <= parseFloat(filters.cantidadMax);
    
    return matchesSearch && matchesProveedor && matchesEstatus && 
           matchesFecha && matchesCantidadMin && matchesCantidadMax;
  });

  // Pagination
  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentPedidos = pedidosFiltrados.slice(idxFirst, idxLast);

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

  return (    <div className="card h-100 p-0 radius-12">
      <div className="card-header d-flex justify-content-between align-items-center py-16 px-24">
        <div className="d-flex align-items-center gap-3">
          <span>Pedidos</span>
          <div className="icon-field">
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Buscar por proveedor, ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="icon">
              <Icon icon="ion:search-outline" />
            </span>
          </div>
          <div>
            <Button 
              id="btnFiltrarPedidos" 
              variant="outline-primary"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-sm"
              size="sm"
            >
              <Icon icon="bi:funnel" /> Filtros
            </Button>
          </div>
        </div>
        <Link to="/crearpedido" id="crearPedidoBtn" className="btn btn-primary btn-sm">
          <Icon icon="ic:baseline-plus" className="icon text-xl" /> Crear Pedido
        </Link>
      </div>{/* Pestaña de filtros colapsible */}
      {showFilters && (
        <div className="card-header border-top bg-light">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Proveedor</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filters.proveedor}
                  onChange={(e) => handleFilterChange('proveedor', e.target.value)}
                >
                  <option value="">Todos los proveedores</option>
                  {getUniqueValues('proveedor').map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Estatus</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filters.estatus}
                  onChange={(e) => handleFilterChange('estatus', e.target.value)}
                >
                  <option value="">Todos los estatus</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Reparto">En Reparto</option>
                  <option value="Completado">Completado</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Rango de Fechas</Form.Label>
                <div className="d-flex gap-1">
                  <Form.Control
                    type="date"
                    size="sm"
                    placeholder="Desde"
                    value={filters.fechaInicio}
                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                  />
                  <Form.Control
                    type="date"
                    size="sm"
                    placeholder="Hasta"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Cantidad</Form.Label>
                <div className="d-flex gap-1">
                  <Form.Control
                    type="number"
                    size="sm"
                    placeholder="Min"
                    value={filters.cantidadMin}
                    onChange={(e) => handleFilterChange('cantidadMin', e.target.value)}
                  />
                  <Form.Control
                    type="number"
                    size="sm"
                    placeholder="Max"
                    value={filters.cantidadMax}
                    onChange={(e) => handleFilterChange('cantidadMax', e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={clearAllFilters}
                disabled={!Object.values(filters).some(f => f !== '') && !searchTerm}
                className="w-100"
              >
                <Icon icon="bi:x-circle" /> Limpiar
              </Button>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              {Object.values(filters).some(f => f !== '') ? 
                `Filtros activos: ${Object.entries(filters).filter(([k,v]) => v !== '').length}` : 
                'Sin filtros aplicados'
              }
            </small>
          </div>
        </div>
      )}
      <div className='card-body p-24 d-flex flex-column' style={{minHeight: '60vh'}}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive scroll-sm flex-grow-1" style={{minHeight: '50vh', maxHeight: '65vh', overflowY: 'auto'}}>
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
      {/* Estadísticas de resultados filtrados y paginación */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24 p-24">        <div>
          <small className="text-muted">
            Mostrando {idxFirst + 1} a {Math.min(idxLast, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
          </small>
        </div>
        {/* Paginación */}
        {totalPages > 1 && (
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon="lucide:chevron-first" />
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon="lucide:chevron-left" />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const delta = 2;
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - delta && page <= currentPage + delta)
                  );
                })
                .reduce((acc, page) => {
                  const last = acc[acc.length - 1];
                  if (last && page - last > 1) {
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, index) => (
                  page === '...' ? (
                    <li key={`ellipsis-${index}`} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  ) : (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="lucide:chevron-right" />
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="lucide:chevron-last" />
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default InvoiceListLayer;