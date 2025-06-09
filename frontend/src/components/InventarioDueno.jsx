import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Modal, Dropdown, Badge } from 'react-bootstrap';
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';



const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [searchTerm, setSearchTerm] = useState('');  const [selectedItems, setSelectedItems] = useState([]);  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [locationTipo, setLocationTipo] = useState('');
  const navigate = useNavigate();

  
  // Estados para filtros por columna
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria: '',
    ubicacion: '',
    stockStatus: '',
    temporada: '',
    precioMin: '',
    precioMax: ''
  });

  useEffect(() => {
  const fetchInventoryAndArticles = async () => {
    try {
      setLoading(true);
      const cookieData = Cookies.get('UserData');
      if (!cookieData) throw new Error('No se encontró la cookie del usuario');

      const user = JSON.parse(decodeURIComponent(cookieData));
      const locationId = user.LOCATION_ID || user.locationId;
      // Obtener tipo de ubicación desde el backend usando locationId
const locationRes = await axios.get(`http://localhost:5000/location2/getByID/${locationId}`, {
  withCredentials: true
});
setLocationTipo(locationRes.data?.TIPO || '');



      if (!locationId) throw new Error('No se encontró el ID de ubicación del usuario');

      // Obtener inventario por location
      const inventoryResponse = await axios.get(`http://localhost:5000/api/inventory/location/${locationId}`, {
        withCredentials: true
      });

      const inventoryData = inventoryResponse.data;

      // Obtener artículos con datos adicionales
      const articulosResponse = await axios.get(`http://localhost:5000/articulo`, {
        withCredentials: true
      });

      const articulosData = articulosResponse.data;

      // Crear un mapa de artículos por ID
      const articulosMap = {};
      articulosData.forEach(art => {
        articulosMap[art.ARTICULO_ID] = {
          PRECIOVENTA: art.PRECIOVENTA,
          TEMPORADA: art.TEMPORADA,
        };
      });

      // Combinar datos
      const mergedData = inventoryData.map(inv => ({
        ...inv,
        PRECIOVENTA: articulosMap[inv.ARTICULO_ID]?.PRECIOVENTA || null,
        TEMPORADA: articulosMap[inv.ARTICULO_ID]?.TEMPORADA || null,
      }));

      setInventory(mergedData);
      setError(null);
    } catch (err) {
      setError('Error al cargar el inventario: ' + err.message);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  fetchInventoryAndArticles();
}, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentItems.map(item => item.inventarioId);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
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
      categoria: '',
      ubicacion: '',
      stockStatus: '',
      temporada: '',
      precioMin: '',
      precioMax: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Función para obtener valores únicos para filtros
  const getUniqueValues = (field) => {
    const values = inventory.map(item => item[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };  const filteredItems = Array.isArray(inventory) 
    ? inventory.filter(item => {
        // Filtro de búsqueda general
        const matchesSearch = 
  item.NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.INVENTARIO_ID?.toString().includes(searchTerm) ||
  item.ARTICULO_ID?.toString().includes(searchTerm) ||
  item.CATEGORIA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.LOCATION_NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase());

        
        // Filtros por columna
        const matchesCategory = !filters.categoria || item.categoria === filters.categoria;
        const matchesLocation = !filters.ubicacion || item.locationNombre === filters.ubicacion;
        const matchesTemporada = !filters.temporada || item.temporada === filters.temporada;
          // Filtro por estado de stock
        let matchesStockStatus = true;
        if (filters.stockStatus) {
          const stockStatus = item.stockActual < item.stockMinimo ? 'bajo' : 
                             item.stockActual >= (item.stockMinimo * 2) ? 'alto' : 'normal';
          matchesStockStatus = stockStatus === filters.stockStatus;
        }
        
        // Filtros por precio
        const precio = parseFloat(item.precioVenta || 0);
        const matchesPrecioMin = !filters.precioMin || precio >= parseFloat(filters.precioMin);
        const matchesPrecioMax = !filters.precioMax || precio <= parseFloat(filters.precioMax);
        
        return matchesSearch && matchesCategory && matchesLocation && 
               matchesTemporada && matchesStockStatus && matchesPrecioMin && matchesPrecioMax;
      })
    : [];
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = filteredItems.slice(idxFirst, idxLast);

  if (loading) return <div className="text-center p-4">Cargando inventario...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const exportToCSV = () => {
    const headers = [
      'ID Inventario', 'ID Artículo', 'Nombre', 'Categoría', 'Ubicación',
      'Stock Actual', 'Stock Mínimo', 'Stock Recomendado', 'Precio Venta', 'Temporada'
    ];    const rows = filteredItems.map(item => [
      item.inventarioId,
      item.articuloId,
      item.nombre,
      item.categoria,
      item.locationNombre,
      item.stockActual,
      item.stockMinimo,
      item.stockRecomendado,
      item.precioVenta,
      item.temporada,
    ]);
  
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'inventario_filtrado.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };    return (
    <div className='card h-100 p-0 radius-12' style={{minHeight: '80vh'}}>      <div className='card-header d-flex justify-content-between align-items-center py-16 px-24'>        <div className='d-flex flex-wrap align-items-center gap-3'>          <div className='icon-field'>
            <input
              type='text'
              name='search'
              className='form-control form-control-sm'
              style={{ minWidth: '280px' }}
              placeholder='Buscar productos...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className='icon'>
              <Icon icon='ion:search-outline' />
            </span>
          </div>
        </div>        
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <Button 
            id="btnExportarCSV"
            variant="success" 
            onClick={exportToCSV}
            className="btn-sm"
            size="sm"
          >
            <Icon icon="bi:download" /> Exportar CSV
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowFilters(!showFilters)}
            className="btn-sm"
            size="sm"
          >
            <Icon icon="bi:funnel" /> Filtros
          </Button>
          
        </div>      </div>

      {/* Pestaña de filtros colapsible */}
      {showFilters && (
        <div className="card-header border-top bg-light">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Categoría</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {getUniqueValues('categoria').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Ubicación</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filters.ubicacion}
                  onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
                >
                  <option value="">Todas las ubicaciones</option>
                  {getUniqueValues('locationNombre').map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Estado Stock</Form.Label>                <Form.Select 
                  size="sm"
                  value={filters.stockStatus}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="bajo">Stock Crítico (Menor al mínimo)</option>
                  <option value="normal">Stock Moderado (Entre mín. y 2x mín.)</option>
                  <option value="alto">Stock Abundante (2x mínimo o más)</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Temporada</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filters.temporada}
                  onChange={(e) => handleFilterChange('temporada', e.target.value)}
                >
                  <option value="">Todas</option>
                  {getUniqueValues('temporada').map(temp => (
                    <option key={temp} value={temp}>{temp}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Precio</Form.Label>
                <div className="d-flex gap-1">
                  <Form.Control
                    type="number"
                    size="sm"
                    placeholder="Min"
                    value={filters.precioMin}
                    onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                  />
                  <Form.Control
                    type="number"
                    size="sm"
                    placeholder="Max"
                    value={filters.precioMax}
                    onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              {Object.values(filters).some(f => f !== '') ? 
                `Filtros activos: ${Object.entries(filters).filter(([k,v]) => v !== '').length}` : 
                'Sin filtros aplicados'
              }
            </small>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={clearAllFilters}
              disabled={!Object.values(filters).some(f => f !== '') && !searchTerm}
            >
              <Icon icon="bi:x-circle" /> Limpiar filtros
            </Button>
          </div>
        </div>
      )}{/* Tabla con filtros de columna alineados y estilizados */}
      <div className='card-body p-24'>        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando inventario...</span>
            </div>
          </div>
        ) : (
          <>



            <div className="table-responsive scroll-sm">
            <table className='table bordered-table sm-table mb-0'><thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                    />
                  </th>
                  <th>ID Inv.</th>
                  <th>ID Art.</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Stock Actual</th>
                  <th>Stock Mín.</th>
                  <th>Stock Rec.</th>
                  <th>Precio Venta</th>
                  <th>Temporada</th>
    {(locationTipo === 'Proveedor' || locationTipo === 'Almacén' || locationTipo === 'Sucursal') && (
      <th>Acción</th>
    )}
                </tr>
              </thead><tbody>
                {currentItems.length > 0 ? (                  currentItems.map((item) => {
                    let stockStatus = 'normal';
                    let rowClass = '';
                    
                    // Nueva lógica de colores según los criterios especificados
                    if (item.stockActual < item.stockMinimo) {
                      stockStatus = 'bajo';
                      rowClass = 'table-danger';
                    } else if (item.stockActual >= (item.stockMinimo * 2)) {
                      stockStatus = 'alto';
                      rowClass = 'table-success';
                    } else {
                      // Entre stock mínimo y el doble del stock mínimo
                      stockStatus = 'normal';
                      rowClass = '';
                    }
                    
                    return (
                      <tr key={`inv-${item.INVENTARIO_ID}`} className={rowClass}>
  <td>
    <Form.Check
      type="checkbox"
      checked={selectedItems.includes(item.INVENTARIO_ID)}
      onChange={() => handleSelectItem(item.INVENTARIO_ID)}
    />
  </td>
  <td>{item.INVENTARIO_ID}</td>
  <td>{item.ARTICULO_ID}</td>
  <td><h6 className='text-md mb-0 fw-medium'>{item.NOMBRE}</h6></td>
  <td>{item.CATEGORIA}</td>
  <td>
    {item.LOCATION_NOMBRE || '-'}
    {item.LOCATION_TIPO && (
      <small className="text-muted d-block">({item.LOCATION_TIPO})</small>
    )}
  </td>
  <td>
    <span className={`px-12 py-1 rounded-pill fw-medium text-xs ${
      item.STOCKACTUAL < item.STOCKMINIMO ? 'bg-danger' :
      item.STOCKACTUAL >= (item.STOCKMINIMO * 2) ? 'bg-success' :
      'bg-secondary'
    } text-white`}>
      {item.STOCKACTUAL ?? '-'}
    </span>
  </td>
  <td>{item.STOCKMINIMO ?? '-'}</td>
  <td>{item.STOCKRECOMENDADO ?? '-'}</td>
  <td>${parseFloat(item.PRECIOVENTA || 0)?.toFixed(2)}</td>
  <td>{item.TEMPORADA || '-'}</td>
  {(locationTipo === 'Proveedor' || locationTipo === 'Almacén' || locationTipo === 'Sucursal') && (
  <td>
  <Button
    size="sm"
    variant="outline-primary"
    onClick={() => {
      if (locationTipo === 'Proveedor') {
        navigate('/crearProducto', { state: { inventario: item } });
      } else {
        navigate('/pedirProducto', { state: { inventario: item } });
      }
    }}
  >
    {locationTipo === 'Proveedor' ? 'Crear' : 'Pedir'}
  </Button>
</td>

)}

</tr>

                    );
                  })                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-3">No se encontraron items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Estadísticas de resultados filtrados y paginación */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24 p-24">
            <div>
              <small className="text-muted">
                Mostrando {idxFirst + 1} a {Math.min(idxLast, filteredItems.length)} de {filteredItems.length} productos
              </small>
            </div>
            {totalPages > 1 && (
              <nav className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-primary btn-sm px-2.5 py-1"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon="mdi:chevron-double-left" width="16" />
                </button>
                <button
                  className="btn btn-outline-primary btn-sm px-2.5 py-1"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon="mdi:chevron-left" width="16" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
  .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
  .map((page, index, array) => {
    const prevPage = array[index - 1];
    const isGap = index > 0 && prevPage !== page - 1;

    if (isGap) {
      return (
        <React.Fragment key={`gap-${page}`}>
          <span className="px-1" key={`ellipsis-${page}`}>...</span>
          <button
            key={`btn-${page}`}
            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'} btn-sm px-2.5 py-1`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        </React.Fragment>
      );
    }

    return (
      <button
        key={`btn-${page}`}
        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'} btn-sm px-2.5 py-1`}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </button>
    );
  })}

                <button
                  className="btn btn-outline-primary btn-sm px-2.5 py-1"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="mdi:chevron-right" width="16" />
                </button>
                <button
                  className="btn btn-outline-primary btn-sm px-2.5 py-1"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="mdi:chevron-double-right" width="16" />
                </button>
              </nav>
            )}
          </div>          {selectedItems.length > 0 && (
            <div className="mt-3">
              <Button variant="outline-danger" size="sm">
                <Icon icon="mingcute:delete-2-line" className="me-1" /> Eliminar seleccionados ({selectedItems.length})
              </Button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;