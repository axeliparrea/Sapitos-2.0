import React, { useEffect, useState } from "react";
import { Form, Button, Card, Container, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const NuevoInventario = () => {
  const [articulos, setArticulos] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [selectedArticuloId, setSelectedArticuloId] = useState("");
  const [stockInicial, setStockInicial] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookieData = Cookies.get("UserData");
        if (!cookieData) throw new Error("No se encontró la cookie del usuario");
        const user = JSON.parse(decodeURIComponent(cookieData));
        const locationId = user.LOCATION_ID || user.locationId;

        // Obtener artículos y el inventario de esta ubicación
        const [articulosRes, inventarioRes] = await Promise.all([
          axios.get("http://localhost:5000/articulo", { withCredentials: true }),
          axios.get(`http://localhost:5000/inventory/location/${locationId}`, { withCredentials: true })
        ]);

        const articulosTodos = articulosRes.data;
        const inventarioActual = inventarioRes.data;

        const articulosConInventario = new Set(
          inventarioActual.map(inv => inv.articuloId ?? inv.ARTICULO_ID)
        );

        const disponibles = articulosTodos.filter(
          art => !articulosConInventario.has(art.ARTICULO_ID)
        );

        setArticulos(articulosTodos);
        setArticulosDisponibles(disponibles);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos: " + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      const cookieData = Cookies.get("UserData");
      const user = JSON.parse(decodeURIComponent(cookieData));
      const locationId = user.LOCATION_ID || user.locationId;

      const body = {
        articuloId: parseInt(selectedArticuloId),
        locationId: parseInt(locationId),
        stockActual: parseInt(stockInicial),
        stockMinimo: parseInt(stockMinimo),
        stockRecomendado: parseInt(stockMinimo) * 2,
        stockSeguridad: 0,
        margenGanancia: 0,
        tiempoReposicion: 0,
        demandaPromedio: 0
      };

      await axios.post("http://localhost:5000/inventory/NuevoInventario", {
  articuloId: parseInt(selectedArticuloId),
  locationId: parseInt(locationId),
  stockInicial: parseInt(stockInicial),
  stockMinimo: parseInt(stockMinimo)
}, { withCredentials: true });

      navigate(-1);
    } catch (err) {
      console.error(err);
      setError("Error al guardar inventario: " + err.message);
    }
  };

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>Crear Nuevo Inventario</Card.Header>
        <Card.Body>
          <Form onSubmit={handleGuardar}>
            <Form.Group className="mb-3">
              <Form.Label>Artículo</Form.Label>
              <Form.Select
                required
                value={selectedArticuloId}
                onChange={(e) => setSelectedArticuloId(e.target.value)}
              >
                <option value="">Selecciona un artículo</option>
                {articulosDisponibles.map((art) => (
                  <option key={art.ARTICULO_ID} value={art.ARTICULO_ID}>
                    {art.NOMBRE} ({art.CATEGORIA})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Mostrar detalles del artículo seleccionado */}
            {selectedArticuloId && (
              <div className="mb-4">
                <strong>Detalles del artículo:</strong>
                <ul className="mb-0">
                  {(() => {
                    const articulo = articulosDisponibles.find(a => a.ARTICULO_ID === parseInt(selectedArticuloId));
                    return articulo ? (
                      <>
                        <li><strong>Categoría:</strong> {articulo.CATEGORIA}</li>
                        <li><strong>Temporada:</strong> {articulo.TEMPORADA}</li>
                        <li><strong>Precio Proveedor:</strong> ${articulo.PRECIOPROVEEDOR}</li>
                        <li><strong>Precio Venta:</strong> ${articulo.PRECIOVENTA}</li>
                      </>
                    ) : <li>No se encontró el artículo.</li>;
                  })()}
                </ul>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Stock Inicial (Importación inicial)</Form.Label>
              <Form.Control
                type="number"
                required
                min={1}
                value={stockInicial}
                onChange={(e) => setStockInicial(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock Mínimo</Form.Label>
              <Form.Control
                type="number"
                required
                min={0}
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Guardar Inventario
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NuevoInventario;
