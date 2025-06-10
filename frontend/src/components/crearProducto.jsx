import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Alert, Card, Container, Row, Col } from 'react-bootstrap';

const CrearProducto = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const inventario = state?.inventario;

  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!inventario) {
    return (
      <Container className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger">No se recibió información del inventario.</Alert>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const nuevaCantidad = parseInt(cantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
      setError('Por favor, ingresa una cantidad válida.');
      setLoading(false);
      return;
    }

    try {
      const updatedData = {
        stockActual: inventario.stockActual + nuevaCantidad,
        importacion: (inventario.importacion || 0) + nuevaCantidad,
      };

      const inventoryId = inventario.inventarioId;

      await axios.put(
  `http://localhost:5000/inventory/${inventoryId}`,      // ✅

        updatedData,
        { withCredentials: true }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate("/inventario");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el inventario: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100">
        <Col md={3}></Col>

        <Col md={6}>
          <Card className="p-4 shadow">
            <h4 className="text-center mb-4">Crear producto</h4>

            <p className="text-center"><strong>Producto:</strong> {inventario.nombre}</p>
            <p className="text-center">Stock actual: <strong>{inventario.stockActual}</strong></p>
            <p className="text-center">Importación acumulada: <strong>{inventario.importacion || 0}</strong></p>

            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Cantidad a crear</Form.Label>
                <Form.Control
                  type="number"
                  value={cantidad}
                  min={1}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ingresa una cantidad"
                  required
                />
              </Form.Group>

              <Button type="submit" className="mt-3 w-100 btn-primary text-white" disabled={loading}>
                {loading ? 'Procesando...' : 'Actualizar Inventario'}
              </Button>
            </Form>

            {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
            {success && <Alert className="mt-3" variant="success">Inventario actualizado correctamente.</Alert>}
          </Card>
        </Col>

        <Col md={3}></Col>
      </Row>
    </Container>
  );
};

export default CrearProducto;
