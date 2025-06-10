import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Card, Alert, Container, Row, Col, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";

const PedirProductoPorInventario = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const inventario = state?.inventario;

  const [cantidad, setCantidad] = useState('');
  const [locationDestino, setLocationDestino] = useState('');
  const [metodoPago, setMetodoPago] = useState(1);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const userCookie = Cookies.get("UserData");
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get("http://localhost:5000/location2", {
          withCredentials: true
        });

        const filtradas = res.data.filter(loc =>
          loc.TIPO === "Proveedor" || loc.TIPO === "Almacén"
        );

        setUbicaciones(filtradas);
      } catch (err) {
        console.error("Error al cargar ubicaciones:", err);
        setError("No se pudieron cargar las ubicaciones.");
      }
    };

    fetchUbicaciones();
  }, []);

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
  setError('');
  setSuccess(false);

  const parsedCantidad = parseInt(cantidad);
  const parsedLocation = parseInt(locationDestino);

  if (isNaN(parsedCantidad) || parsedCantidad <= 0 || !parsedLocation) {
    setError("Completa todos los campos con valores válidos.");
    setLoading(false);
    return;
  }

  const payload = {
    creado_por_id: user?.locationId,
    modificado_por_id: parsedLocation,
    tipoOrden: "venta",
    metodopago_id: parseInt(metodoPago),
    productos: [
      {
        inventario_id: inventario.INVENTARIO_ID || inventario.inventarioId,
        cantidad: parsedCantidad
      }
    ]
  };

  console.log("🧾 Payload a enviar:", payload);

  try {
    await axios.post("http://localhost:5000/ordenes", payload, {
      withCredentials: true
    });

    setSuccess(true);
    setTimeout(() => {
      navigate("/inventario");
    }, 1500);
  } catch (err) {
    console.error("❌ Error al enviar pedido:", err);
    console.log("🧨 Respuesta del backend:", err.response?.data);
    setError("Hubo un error al enviar el pedido.");
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
            <h4 className="text-center mb-4">Pedir producto</h4>

            <p className="text-center"><strong>Producto:</strong> {inventario.NOMBRE || inventario.nombre}</p>
            <p className="text-center"><strong>Stock actual:</strong> {inventario.STOCKACTUAL || inventario.stockActual}</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad a pedir</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ingresa cantidad"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location de orden</Form.Label>
                <Form.Select
                  value={locationDestino}
                  onChange={(e) => setLocationDestino(e.target.value)}
                  required
                >
                  <option value="">Selecciona una ubicación</option>
                  {ubicaciones.map((loc) => (
                    <option key={loc.LOCATION_ID} value={loc.LOCATION_ID}>
                      {loc.NOMBRE} - {loc.TIPO}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Método de pago</Form.Label>
                <Form.Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  required
                >
                  <option value={1}>Transferencia</option>
                  <option value={2}>Tarjeta Crédito</option>
                  <option value={3}>Efectivo</option>
                </Form.Select>
              </Form.Group>

              <Button className="w-100" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : "Realizar pedido"}
              </Button>
            </Form>

            {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
            {success && <Alert className="mt-3" variant="success">Pedido realizado correctamente.</Alert>}
          </Card>
        </Col>

        <Col md={3}></Col>
      </Row>
    </Container>
  );
};

export default PedirProductoPorInventario;
