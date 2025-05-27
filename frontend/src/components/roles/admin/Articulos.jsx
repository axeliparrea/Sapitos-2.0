import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Table, Spinner, Alert, Form, InputGroup, Button
} from "react-bootstrap";
import {
  FaSearch, FaTimes
} from "react-icons/fa";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticulos = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/articulo2");
        setArticulos(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (err) {
        console.error("Error al obtener artículos:", err);
        setError("No se pudieron obtener los artículos.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticulos();
  }, []);

  const articulosFiltrados = articulos.filter((articulo) => {
    const nombre = articulo?.NOMBRE?.toLowerCase() || "";
    const categoria = articulo?.CATEGORIA?.toLowerCase() || "";
    return (
      nombre.includes(searchTerm.toLowerCase()) ||
      categoria.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <h1 className="text-primary mb-4">Lista de Artículos</h1>

        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-white">
            <FaSearch className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-start-0"
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
              className="border-start-0"
            >
              <FaTimes />
            </Button>
          )}
        </InputGroup>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Cargando artículos...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && articulosFiltrados.length > 0 && (
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Proveedor</th>
                <th>Precio Venta</th>
                <th>Temporada</th>
              </tr>
            </thead>
            <tbody>
              {articulosFiltrados.map((articulo) => (
                <tr key={articulo.ARTICULO_ID}>
                  <td>{articulo.ARTICULO_ID}</td>
                  <td>{articulo.NOMBRE}</td>
                  <td>{articulo.CATEGORIA}</td>
                  <td>${parseFloat(articulo.PRECIOPROVEEDOR).toFixed(2)}</td>
                  <td>${parseFloat(articulo.PRECIOVENTA).toFixed(2)}</td>
                  <td>{articulo.TEMPORADA}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {!loading && articulosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            No hay artículos que coincidan con la búsqueda.
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default Articulos;
