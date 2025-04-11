import React, { useState } from 'react';
import { Table, Form, InputGroup, Button, Badge, Modal } from 'react-bootstrap';

const InventoryExample = () => {
  // Datos de inventario de ropa hardcodeados
  const initialInventory = [
    {
      id: "001",
      nombre: "Camiseta Básica",
      codigo: "001",
      descripcion: "Camiseta algodón, varios colores",
      estatus: "Activo",
      stock: 120,
      cantidadFaltante: 0,
      diasParaRestock: 15
    },
    {
      id: "002",
      nombre: "Jeans Slim Fit",
      codigo: "002",
      descripcion: "Jeans ajustados para hombre",
      estatus: "Activo",
      stock: 85,
      cantidadFaltante: 0,
      diasParaRestock: 10
    },
    {
      id: "003",
      nombre: "Vestido Floral",
      codigo: "003",
      descripcion: "Vestido estampado para mujer",
      estatus: "Vencido",
      stock: 5,
      cantidadFaltante: 45,
      diasParaRestock: 5
    },
    {
      id: "004",
      nombre: "Sudadera con Capucha",
      codigo: "004",
      descripcion: "Sudadera unisex con bolsillos",
      estatus: "Activo",
      stock: 60,
      cantidadFaltante: 0,
      diasParaRestock: 20
    },
    {
      id: "005",
      nombre: "Pantalón Chino",
      codigo: "005",
      descripcion: "Pantalón casual para hombre",
      estatus: "Vencido",
      stock: 8,
      cantidadFaltante: 42,
      diasParaRestock: 7
    },
    {
      id: "006",
      nombre: "Blusa de Seda",
      codigo: "006",
      descripcion: "Blusa elegante para mujer",
      estatus: "Activo",
      stock: 70,
      cantidadFaltante: 0,
      diasParaRestock: 12
    },
    {
      id: "007",
      nombre: "Shorts Deportivos",
      codigo: "007",
      descripcion: "Shorts ligeros para ejercicio",
      estatus: "Activo",
      stock: 45,
      cantidadFaltante: 5,
      diasParaRestock: 8
    }
  ];

  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    nombre: '',
    descripcion: '',
    estatus: 'Activo',
    stock: 0,
    cantidadFaltante: 0,
    diasParaRestock: 0
  });

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

  const filteredItems = inventory.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'primary';
      case 'vencido':
        return 'danger';
      default:
        return 'info';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitNewProduct = (e) => {
    e.preventDefault();
    // Simular añadir producto
    const newId = String(inventory.length + 1).padStart(3, '0');
    const productToAdd = {
      ...newProduct,
      id: newProduct.id || newId,
      codigo: newProduct.id || newId
    };
    
    setInventory([...inventory, productToAdd]);
    setShowModal(false);
    setNewProduct({
      id: '',
      nombre: '',
      descripcion: '',
      estatus: 'Activo',
      stock: 0,
      cantidadFaltante: 0,
      diasParaRestock: 0
    });
  };

  return (
    <div className="inventory-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i> Agregar Item
          </Button>
          <Button variant="outline-secondary">Exportar</Button>
        </div>
      </div>
      
      <div className="d-flex justify-content-between mb-3">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button variant="outline-secondary">
          <i className="bi bi-funnel"></i> Filtrar
        </Button>
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
            <th>Descripción</th>
            <th>Estatus</th>
            <th>Stock</th>
            <th>Cantidad Faltante</th>
            <th>Días para Restock</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </td>
                <td>{item.id}</td>
                <td>
                  <div>{item.nombre}</div>
                  <small className="text-muted">{item.codigo}</small>
                </td>
                <td>{item.descripcion}</td>
                <td>
                  <Badge bg={getStatusBadgeVariant(item.estatus)}>
                    {item.estatus}
                  </Badge>
                </td>
                <td>{item.stock}</td>
                <td>{item.cantidadFaltante}</td>
                <td>{item.diasParaRestock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No se encontraron items</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal para agregar nuevo producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitNewProduct}>
            <Form.Group className="mb-3" controlId="formProductId">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                name="id"
                value={newProduct.id}
                onChange={handleInputChange}
              />
            </Form.Group>
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
            <Form.Group className="mb-3" controlId="formProductDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={newProduct.descripcion}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductStatus">
              <Form.Label>Estatus</Form.Label>
              <Form.Select
                name="estatus"
                value={newProduct.estatus}
                onChange={handleInputChange}
              >
                <option value="Activo">Activo</option>
                <option value="Vencido">Vencido</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductQuantity">
              <Form.Label>Cantidad Faltante</Form.Label>
              <Form.Control
                type="number"
                name="cantidadFaltante"
                value={newProduct.cantidadFaltante}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductDays">
              <Form.Label>Días para Restock</Form.Label>
              <Form.Control
                type="number"
                name="diasParaRestock"
                value={newProduct.diasParaRestock}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" type="submit">Guardar</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryExample;