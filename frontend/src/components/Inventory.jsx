import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Modal, Dropdown, Badge } from 'react-bootstrap';
import axios from 'axios';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Estados del filtro 
  const [filters, setFilters] = useState({
    proveedor: [],
    categoria: [],
    stockStatus: [] 
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    proveedores: [],
    categorias: []
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
          const proveedores = [...new Set(response.data.map(item => item.proveedor).filter(Boolean))];
          const categorias = [...new Set(response.data.map(item => item.categoria).filter(Boolean))];
          
          setFilterOptions({
            proveedores,
            categorias
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
      const allIds = filteredItems.map(item => item.id);
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
      proveedor: [],
      categoria: [],
      stockStatus: []
    });
  };

  const filteredItems = Array.isArray(inventory) 
    ? inventory.filter(item => {
        const matchesSearch = 
          item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.id?.toString() || '').includes(searchTerm) ||
          item.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // proveedor
        const matchesProveedor = filters.proveedor.length === 0 || 
          filters.proveedor.includes(item.proveedor);
        
        // categoría
        const matchesCategoria = filters.categoria.length === 0 || 
          filters.categoria.includes(item.categoria);
        
        // estado de stock
        const matchesStockStatus = filters.stockStatus.length === 0 || 
          (filters.stockStatus.includes('bajo') && item.stockActual <= item.stockMinimo) ||
          (filters.stockStatus.includes('normal') && item.stockActual > item.stockMinimo);
        
        return matchesSearch && matchesProveedor && matchesCategoria && matchesStockStatus;
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
    const headers = ['ID', 'Nombre', 'Proveedor', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio Compra', 'Precio Venta', 'Última Compra', 'Última Venta'];
    const rows = filteredItems.map(item => [
      item.id,
      item.nombre,
      item.proveedor,
      item.categoria,
      item.stockActual,
      item.stockMinimo,
      item.precioCompra,
      item.precioVenta,
      formatDate(item.fechaUltimaCompra),
      formatDate(item.fechaUltimaVenta),
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
            placeholder="Buscar por nombre, ID, proveedor o categoría..."
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
            {/* Filtro de Proveedores */}
            <div className="col-md-4 mb-3">
              <h6 className="fw-bold text-muted">Proveedor</h6>
              <div className="filter-options" style={{maxHeight: '250px', overflowY: 'auto', paddingRight: '10px'}}>
                {filterOptions.proveedores.map(proveedor => (
                  <Form.Check 
                    key={proveedor}
                    type="checkbox"
                    id={`filter-prov-${proveedor}`}
                    label={proveedor}
                    checked={filters.proveedor.includes(proveedor)}
                    onChange={() => toggleFilter('proveedor', proveedor)}
                  />
                ))}
              </div>
            </div>
            
            {/* Filtro de Categorías */}
            <div className="col-md-4 mb-3">
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
            
            {/* Filtro de Estado de Stock */}
            <div className="col-md-4 mb-3">
              <h6 className="fw-bold text-muted">Estado de Stock</h6>
              <Form.Check 
                type="checkbox"
                id="filter-stock-bajo"
                label="Bajo stock (menor o igual al mínimo)"
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
            </div>
          </div>
        </div>
      )}


      <Table responsive bordered hover>
        <thead className="table-light">
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              />
            </th>
            <th>#</th>
            <th>Nombre</th>
            <th>
              Proveedor
              <Dropdown className="d-inline-block ms-1">
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-proveedor" style={{padding: '0 5px'}}>
                  <i className="bi bi-funnel-fill" style={{fontSize: '0.7rem'}}></i>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {filterOptions.proveedores.map(proveedor => (
                    <Dropdown.Item key={proveedor} onClick={() => toggleFilter('proveedor', proveedor)}>
                      <Form.Check 
                        type="checkbox"
                        checked={filters.proveedor.includes(proveedor)}
                        label={proveedor}
                        onChange={() => {}}
                        onClick={e => e.stopPropagation()}
                      />
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </th>
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
                </Dropdown.Menu>
              </Dropdown>
            </th>
            <th>Stock Mínimo</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Última Compra</th>
            <th>Última Venta</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <tr key={item.id} className={item.stockActual <= item.stockMinimo ? "table-danger" : ""}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </td>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.proveedor}</td>
                <td>{item.categoria}</td>
                <td>{item.stockActual}</td>
                <td>{item.stockMinimo}</td>
                <td>${parseFloat(item.precioCompra)?.toFixed(2)}</td>
                <td>${parseFloat(item.precioVenta)?.toFixed(2)}</td>
                <td>{formatDate(item.fechaUltimaCompra)}</td>
                <td>{formatDate(item.fechaUltimaVenta)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">No se encontraron items</td>
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