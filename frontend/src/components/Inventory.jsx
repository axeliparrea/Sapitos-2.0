import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Modal, Dropdown, Badge } from 'react-bootstrap';
import axios from 'axios';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const API_BASE_URL = "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";
  
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
        const response = await fetch(`${API_BASE_URL}/inventory`, {
          credentials: "include",
        });
        const data = await response.json();
        console.log('Datos del inventario:', data);
        setInventory(data);
        
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
      const allIds = filteredItems.map(item => item.inventarioId);
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
    <div className="inventory-container mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            id="buscadorInventario" 
            placeholder="Buscar por nombre, ID, categoría o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <div>
          <Button 
            id="btnExportarCSV"
            variant="success" 
            onClick={exportToCSV}
            className="me-5 p-3"
          >
            <i className="bi bi-download"></i> Exportar CSV
          </Button>
          
          <Button 
            id="btnFiltrarInventario" 
            variant={activeFilterCount > 0 ? "primary" : "outline-secondary"} 
            onClick={() => setShowFilters(!showFilters)}
            className="position-relative p-3"
          >
            <i className="bi bi-funnel"></i> Filtrar
            {activeFilterCount > 0 && (
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filter-panel p-4 mb-3 border rounded shadow-sm bg-light">
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
          </div>
        </div>
      )}

      <Table responsive bordered hover className="sapitos-table-styles"> {/* Added custom class */}
        <thead className="table-light">
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              />
            </th>
            <th>ID Inv.</th>
            <th>ID Art.</th>
            <th>Nombre</th>
            <th>
              Categoría
              <Dropdown className="d-inline-block ms-1">
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-categoria" style={{padding: '0 5px'}}>
                  <i className="bi bi-funnel-fill" style={{fontSize: '0.7rem'}}></i>
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
              Ubicación
              <Dropdown className="d-inline-block ms-1">
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-location" style={{padding: '0 5px'}}>
                  <i className="bi bi-funnel-fill" style={{fontSize: '0.7rem'}}></i>
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
              Stock Actual
              <Dropdown className="d-inline-block ms-1">
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-stock" style={{padding: '0 5px'}}>
                  <i className="bi bi-funnel-fill" style={{fontSize: '0.7rem'}}></i>
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
            {/* Removed: Precio Prov., Margen %, Última Import., Última Export. */}
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
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
                  <td>{item.nombre}</td>
                  <td>{item.categoria}</td>
                  <td>
                    {item.locationNombre}
                    {item.locationTipo && (
                      <small className="text-muted d-block">({item.locationTipo})</small>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${stockStatus === 'bajo' ? 'bg-danger' : stockStatus === 'alto' ? 'bg-success' : 'bg-secondary'}`}>
                      {item.stockActual}
                    </span>
                  </td>
                  <td>{item.stockMinimo}</td>
                  <td>{item.stockRecomendado}</td>
                  <td>${parseFloat(item.precioVenta || 0)?.toFixed(2)}</td>
                  <td>{item.temporada || '-'}</td>
                  {/* Removed: precioProveedor, margenGanancia, fechaUltimaImportacion, fechaUltimaExportacion */}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="text-center">No se encontraron items</td> {/* Adjusted colSpan */}
            </tr>
          )}
        </tbody>
      </Table>

      {/* Estadísticas de resultados filtrados */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <small className="text-muted">
            Mostrando {filteredItems.length} de {inventory.length} productos
            {activeFilterCount > 0 ? ` (${activeFilterCount} filtros aplicados)` : ''}
          </small>
        </div>
        <div>
          {selectedItems.length > 0 && (
            <Button variant="outline-danger" size="sm">
              <i className="bi bi-trash"></i> Eliminar seleccionados ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;