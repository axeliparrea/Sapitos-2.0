import React, { useState, useEffect } from 'react';
import { Table, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    proveedor: '',
    nombre: '',
    categoria: '',
    stockActual: 0,
    stockMinimo: 0,
    fechaUltimaCompra: '',
    fechaUltimaVenta: '',
    precioCompra: 0,
    precioVenta: 0
    // temporada: '',
    // margenGanancia: 0,
    // tiempoReposicionProm: 0,
    // demandaProm: 0,
    // stockSeguridad: 0
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/inventory');
        console.log('Tipo de response.data:', typeof response.data, response.data);
        setInventory(response.data);
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
      const allIds = inventory.map(item => item.id);
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

  const filteredItems = Array.isArray(inventory) 
  ? inventory.filter(item =>
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id?.toString() || '').includes(searchTerm) ||
      item.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria?.toLowerCase().includes(searchTerm.toLowerCase()))
  : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitNewProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inventory', newProduct);
      setShowModal(false); 
      setNewProduct({
        id: '',
        proveedor: '',
        nombre: '',
        categoria: '',
        stockActual: 0,
        stockMinimo: 0,
        fechaUltimaCompra: '',
        fechaUltimaVenta: '',
        precioCompra: 0,
        precioVenta: 0
        // temporada: '',
        // margenGanancia: 0,
        // tiempoReposicionProm: 0,
        // demandaProm: 0,
        // stockSeguridad: 0
      });
      
      const response = await axios.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      setError('Error al agregar el producto: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) return <div className="text-center p-4">Cargando inventario...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="inventory-container mb-5">
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i> Agregar Item
          </Button>
          <Button variant="outline-secondary">Exportar</Button>
        </div>
      </div> */}
      
      <div className="d-flex justify-content-between mb-4">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar por nombre, ID, proveedor o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        {/* <Button variant="outline-secondary">
          <i className="bi bi-funnel"></i> Filtrar
        </Button> */}
      </div>

      <Table responsive bordered hover>
        <thead className="table-light">
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedItems.length === inventory.length && inventory.length > 0}
              />
            </th>
            <th>#</th>
            <th>Nombre</th>
            <th>Proveedor</th>
            <th>Categoría</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Última Compra</th>
            <th>Última Venta</th>
            {/* <th>Precio Compra</th>
            <th>Precio Venta</th> */}
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


      {/* // Esto solo es para agregar una funcion de insertado */}
      {/* Se puede borrar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitNewProduct}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={newProduct.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formProductProveedor">
                  <Form.Label>Proveedor</Form.Label>
                  <Form.Control
                    type="text"
                    name="proveedor"
                    value={newProduct.proveedor}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formProductCategoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    type="text"
                    name="categoria"
                    value={newProduct.categoria}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3" controlId="formProductStockActual">
                  <Form.Label>Stock Actual</Form.Label>
                  <Form.Control
                    type="number"
                    name="stockActual"
                    value={newProduct.stockActual}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-3" controlId="formProductStockMinimo">
                  <Form.Label>Stock Mínimo</Form.Label>
                  <Form.Control
                    type="number"
                    name="stockMinimo"
                    value={newProduct.stockMinimo}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formProductPrecioCompra">
                  <Form.Label>Precio Compra</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="precioCompra"
                    value={newProduct.precioCompra}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="formProductPrecioVenta">
                  <Form.Label>Precio Venta</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="precioVenta"
                    value={newProduct.precioVenta}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3" controlId="formProductTemporada">
                  <Form.Label>Temporada</Form.Label>
                  <Form.Control
                    type="text"
                    name="temporada"
                    value={newProduct.temporada}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3" controlId="formProductMargen">
                  <Form.Label>Margen Ganancia (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="margenGanancia"
                    value={newProduct.margenGanancia}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3" controlId="formProductTiempoReposicion">
                  <Form.Label>Tiempo Reposición (días)</Form.Label>
                  <Form.Control
                    type="number"
                    name="tiempoReposicionProm"
                    value={newProduct.tiempoReposicionProm}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Inventory;