import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Modal, Dropdown, Badge } from 'react-bootstrap';
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from 'axios';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados del filtro 
  const [filters, setFilters] = useState({
    categoria: [],
    location: [],
    temporada: [],
    stockStatus: [] 
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    categorias: [],
    locations: [],
    temporadas: []
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/inventory');
        console.log('Tipo de response.data:', typeof response.data, response.data);
        setInventory(response.data);
        
        // Extraer opciones de filtro únicas
        if (Array.isArray(response.data)) {
          const categorias = [...new Set(response.data.map(item => item.categoria).filter(Boolean))];
          const locations = [...new Set(response.data.map(item => item.locationNombre).filter(Boolean))];
          const temporadas = [...new Set(response.data.map(item => item.temporada).filter(Boolean))];
          
          setFilterOptions({
            categorias,
            locations,
            temporadas
          });
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar el inventario: ' + err.message);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentItems.map(item => item.inventarioId);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleFilter = (type, value) => {
    setFilters(prevFilters => {
      if (prevFilters[type].includes(value)) {
        return {
          ...prevFilters,
          [type]: prevFilters[type].filter(item => item !== value)
        };
      } else {
        return {
          ...prevFilters,
          [type]: [...prevFilters[type], value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categoria: [],
      location: [],
      temporada: [],
      stockStatus: []
    });
  };

  const filteredItems = Array.isArray(inventory) 
    ? inventory.filter(item => {
        const matchesSearch = 
          item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.inventarioId?.toString() || '').includes(searchTerm) ||
          (item.articuloId?.toString() || '').includes(searchTerm) ||
          item.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.locationNombre?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // categoría
        const matchesCategoria = filters.categoria.length === 0 || 
          filters.categoria.includes(item.categoria);
        
        // ubicación
        const matchesLocation = filters.location.length === 0 || 
          filters.location.includes(item.locationNombre);
        
        // temporada
        const matchesTemporada = filters.temporada.length === 0 || 
          filters.temporada.includes(item.temporada);
        
        // estado de stock
        const matchesStockStatus = filters.stockStatus.length === 0 || 
          (filters.stockStatus.includes('bajo') && item.stockActual <= item.stockMinimo) ||
          (filters.stockStatus.includes('normal') && item.stockActual > item.stockMinimo && item.stockActual <= item.stockRecomendado) ||
          (filters.stockStatus.includes('alto') && item.stockActual > item.stockRecomendado);
        
        return matchesSearch && matchesCategoria && matchesLocation && matchesTemporada && matchesStockStatus;
      })
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };
    // Contador de filtros activos
  const activeFilterCount = Object.values(filters).reduce(
    (count, filterArray) => count + filterArray.length, 0
  );

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
    ];
    const rows = filteredItems.map(item => [
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
  };
    return (
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header d-flex justify-content-between align-items-center py-16 px-24'>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <div className='d-flex align-items-center gap-2'>
            <span>Inventario</span>
          </div>
          <div className='icon-field'>
            <input
              type='text'
              name='search'
              className='form-control form-control-sm w-auto'
              placeholder='Buscar por nombre, ID, categoría...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />            <span className='icon'>
              <Icon icon='ion:search-outline' />
            </span>
          </div>
          <div>
            <Button 
              id="btnFiltrarInventario" 
              variant={activeFilterCount > 0 ? "primary" : "outline-secondary"} 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-sm position-relative"
              size="sm"            >
              <Icon icon="bi:funnel" /> Filtrar
              {activeFilterCount > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        <div className='d-flex flex-wrap align-items-center gap-3'>
          <Button 
            id="btnExportarCSV"
            variant="success" 
            onClick={exportToCSV}
            className="btn-sm"
            size="sm"          >
            <Icon icon="bi:download" /> Exportar CSV
          </Button>
        </div>
      </div>      {/* Panel de filtros */}
      {showFilters && (
        <div className="filter-panel p-4 mb-3 border rounded shadow-sm bg-light mx-24">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0 text-primary">Filtros</h5>
            <Button id="btnLimpiarFiltros" variant="link" size="sm" onClick={clearFilters} className="text-danger">
              Limpiar filtros
            </Button>
          </div>
          
          <div className="row">
            {/* Filtro de Categorías */}
            <div className="col-md-3 mb-3">
              <h6 className="fw-bold text-muted">Categoría</h6>
              <div className="filter-options" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                {filterOptions.categorias.map(categoria => (
                  <Form.Check 
                    key={categoria}
                    type="checkbox"
                    id={`filter-cat-${categoria}`}
                    label={categoria}
                    checked={filters.categoria.includes(categoria)}
                    onChange={() => toggleFilter('categoria', categoria)}
                  />
                ))}
              </div>
            </div>
            
            {/* Filtro de Ubicaciones */}
            <div className="col-md-3 mb-3">
              <h6 className="fw-bold text-muted">Ubicación</h6>
              <div className="filter-options" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                {filterOptions.locations.map(location => (
                  <Form.Check 
                    key={location}
                    type="checkbox"
                    id={`filter-loc-${location}`}
                    label={location}
                    checked={filters.location.includes(location)}
                    onChange={() => toggleFilter('location', location)}
                  />
                ))}
              </div>
            </div>

            {/* Filtro de Temporadas */}
            <div className="col-md-3 mb-3">
              <h6 className="fw-bold text-muted">Temporada</h6>
              <div className="filter-options" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                {filterOptions.temporadas.map(temporada => (
                  <Form.Check 
                    key={temporada}
                    type="checkbox"
                    id={`filter-temp-${temporada}`}
                    label={temporada}
                    checked={filters.temporada.includes(temporada)}
                    onChange={() => toggleFilter('temporada', temporada)}
                  />
                ))}
              </div>
            </div>
            
            {/* Filtro de Estado de Stock */}
            <div className="col-md-3 mb-3">
              <h6 className="fw-bold text-muted">Estado de Stock</h6>
              <Form.Check 
                type="checkbox"
                id="filter-stock-bajo"
                label="Bajo stock (≤ mínimo)"
                checked={filters.stockStatus.includes('bajo')}
                onChange={() => toggleFilter('stockStatus', 'bajo')}
              />
              <Form.Check 
                type="checkbox"
                id="filter-stock-normal"
                label="Stock normal"
                checked={filters.stockStatus.includes('normal')}
                onChange={() => toggleFilter('stockStatus', 'normal')}
              />
              <Form.Check 
                type="checkbox"
                id="filter-stock-alto"
                label="Stock alto (> recomendado)"
                checked={filters.stockStatus.includes('alto')}
                onChange={() => toggleFilter('stockStatus', 'alto')}
              />
            </div>
          </div>        </div>
      )}

      <div className='card-body p-24'>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando inventario...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className='table bordered-table sm-table mb-0'>
              <thead>
                <tr>
                  <th>                    <Form.Check
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                    />
                  </th>
                  <th>ID Inv.</th>
                  <th>ID Art.</th>
                  <th>Nombre</th>
                  <th>
                    Categoría                    <Dropdown className="d-inline-block ms-1">
                      <Dropdown.Toggle variant="light" size="sm" id="dropdown-categoria" style={{padding: '0 5px'}}>
                        <Icon icon="bi:funnel-fill" style={{fontSize: '0.7rem'}} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {filterOptions.categorias.map(categoria => (
                          <Dropdown.Item key={categoria} onClick={() => toggleFilter('categoria', categoria)}>
                            <Form.Check 
                              type="checkbox"
                              checked={filters.categoria.includes(categoria)}
                              label={categoria}
                              onChange={() => {}}
                              onClick={e => e.stopPropagation()}
                            />
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </th>
                  <th>
                    Ubicación                    <Dropdown className="d-inline-block ms-1">
                      <Dropdown.Toggle variant="light" size="sm" id="dropdown-location" style={{padding: '0 5px'}}>
                        <Icon icon="bi:funnel-fill" style={{fontSize: '0.7rem'}} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {filterOptions.locations.map(location => (
                          <Dropdown.Item key={location} onClick={() => toggleFilter('location', location)}>
                            <Form.Check 
                              type="checkbox"
                              checked={filters.location.includes(location)}
                              label={location}
                              onChange={() => {}}
                              onClick={e => e.stopPropagation()}
                            />
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </th>
                  <th>
                    Stock Actual                    <Dropdown className="d-inline-block ms-1">
                      <Dropdown.Toggle variant="light" size="sm" id="dropdown-stock" style={{padding: '0 5px'}}>
                        <Icon icon="bi:funnel-fill" style={{fontSize: '0.7rem'}} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => toggleFilter('stockStatus', 'bajo')}>
                          <Form.Check 
                            type="checkbox"
                            checked={filters.stockStatus.includes('bajo')}
                            label="Bajo stock"
                            onChange={() => {}}
                            onClick={e => e.stopPropagation()}
                          />
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => toggleFilter('stockStatus', 'normal')}>
                          <Form.Check 
                            type="checkbox"
                            checked={filters.stockStatus.includes('normal')}
                            label="Stock normal"
                            onChange={() => {}}
                            onClick={e => e.stopPropagation()}
                          />
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => toggleFilter('stockStatus', 'alto')}>
                          <Form.Check 
                            type="checkbox"
                            checked={filters.stockStatus.includes('alto')}
                            label="Stock alto"
                            onChange={() => {}}
                            onClick={e => e.stopPropagation()}
                          />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </th>
                  <th>Stock Mín.</th>
                  <th>Stock Rec.</th>
                  <th>Precio Venta</th>
                  <th>Temporada</th>
                </tr>
              </thead>              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => {
                    let stockStatus = 'normal';
                    let rowClass = '';
                    
                    if (item.stockActual <= item.stockMinimo) {
                      stockStatus = 'bajo';
                      rowClass = 'table-danger';
                    } else if (item.stockActual > item.stockRecomendado) {
                      stockStatus = 'alto';
                      rowClass = 'table-success';
                    }
                    
                    return (
                      <tr key={item.inventarioId} className={rowClass}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedItems.includes(item.inventarioId)}
                            onChange={() => handleSelectItem(item.inventarioId)}
                          />
                        </td>
                        <td>{item.inventarioId}</td>
                        <td>{item.articuloId}</td>
                        <td><h6 className='text-md mb-0 fw-medium'>{item.nombre}</h6></td>
                        <td>{item.categoria}</td>
                        <td>
                          {item.locationNombre}
                          {item.locationTipo && (
                            <small className="text-muted d-block">({item.locationTipo})</small>
                          )}
                        </td>
                        <td>
                          <span className={`px-12 py-1 rounded-pill fw-medium text-xs ${stockStatus === 'bajo' ? 'bg-danger text-white' : stockStatus === 'alto' ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                            {item.stockActual}
                          </span>
                        </td>
                        <td>{item.stockMinimo}</td>
                        <td>{item.stockRecomendado}</td>
                        <td>${parseFloat(item.precioVenta || 0)?.toFixed(2)}</td>
                        <td>{item.temporada || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-3">No se encontraron items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>      {/* Estadísticas de resultados filtrados */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24 p-24">
        <div>
          <small className="text-muted">
            Mostrando {idxFirst + 1} a {Math.min(idxLast, filteredItems.length)} de {filteredItems.length} productos
            {activeFilterCount > 0 ? ` (${activeFilterCount} filtros aplicados)` : ''}
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
          </nav>        )}
        
        <div>
          {selectedItems.length > 0 && (
            <Button variant="outline-danger" size="sm">
              <Icon icon="mingcute:delete-2-line" className="me-1" /> Eliminar seleccionados ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;