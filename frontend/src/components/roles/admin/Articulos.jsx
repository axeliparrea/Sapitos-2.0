import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Table, Spinner, Alert, Form, InputGroup, Button, Modal
} from "react-bootstrap";
import {
  FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown
} from "react-icons/fa";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [articuloEditando, setArticuloEditando] = useState(null);
  const [nuevoArticulo, setNuevoArticulo] = useState({
    NOMBRE: "",
    CATEGORIA: "",
    PRECIOPROVEEDOR: "",
    PRECIOVENTA: "",
    TEMPORADA: ""
  });

  const [ordenColumna, setOrdenColumna] = useState(null);
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  useEffect(() => {
    fetchArticulos();
  }, []);

  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/articulo2");
      const dataConGanancia = (Array.isArray(response.data) ? response.data : [response.data]).map((articulo) => ({
        ...articulo,
        GANANCIA: parseFloat(articulo.PRECIOVENTA) - parseFloat(articulo.PRECIOPROVEEDOR)
      }));
      setArticulos(dataConGanancia);
    } catch (err) {
      console.error("Error al obtener artículos:", err);
      setError("No se pudieron obtener los artículos.");
    } finally {
      setLoading(false);
    }
  };

  const ordenarPor = (columna) => {
    if (ordenColumna === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenColumna(columna);
      setOrdenAscendente(true);
    }
  };

  const getIconoOrden = (columna) => {
    if (ordenColumna !== columna) return <FaSort className="ms-1 text-muted" />;
    return ordenAscendente ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  const articulosFiltrados = articulos
    .filter((articulo) => {
      const nombre = articulo?.NOMBRE?.toLowerCase() || "";
      const categoria = articulo?.CATEGORIA?.toLowerCase() || "";
      return (
        nombre.includes(searchTerm.toLowerCase()) ||
        categoria.includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!ordenColumna) return 0;
      const aVal = a[ordenColumna];
      const bVal = b[ordenColumna];

      if (typeof aVal === "string") {
        return ordenAscendente
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return ordenAscendente ? aVal - bVal : bVal - aVal;
    });

  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setNuevoArticulo({
      NOMBRE: "",
      CATEGORIA: "",
      PRECIOPROVEEDOR: "",
      PRECIOVENTA: "",
      TEMPORADA: ""
    });
    setShowModal(true);
  };

  const abrirModalEditar = (articulo) => {
    setModoEdicion(true);
    setArticuloEditando(articulo);
    setNuevoArticulo({ ...articulo });
    setShowModal(true);
  };

  const guardarArticulo = async () => {
    try {
      const payload = {
        Nombre: nuevoArticulo.NOMBRE,
        Categoria: nuevoArticulo.CATEGORIA,
        PrecioProveedor: parseFloat(nuevoArticulo.PRECIOPROVEEDOR),
        PrecioVenta: parseFloat(nuevoArticulo.PRECIOVENTA),
        Temporada: nuevoArticulo.TEMPORADA
      };

      if (modoEdicion) {
        await axios.put(`http://localhost:5000/articulo2/${articuloEditando.ARTICULO_ID}`, payload);
      } else {
        await axios.post("http://localhost:5000/articulo2", payload);
      }

      setShowModal(false);
      fetchArticulos();
    } catch (err) {
      alert("Error al guardar el artículo.");
    }
  };

  const eliminarArticulo = async (id) => {
    if (!window.confirm("¿Deseas eliminar este artículo?")) return;

    try {
      await axios.delete(`http://localhost:5000/articulo2/${id}`);
      fetchArticulos();
    } catch (err) {
      alert("Error al eliminar artículo.");
    }
  };

  const handleChange = (e) => {
    setNuevoArticulo({ ...nuevoArticulo, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">Lista de Artículos</h1>
          <Button variant="success" onClick={abrirModalAgregar}>
            <FaPlus className="me-2" /> Agregar Artículo
          </Button>
        </div>

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
                <th onClick={() => ordenarPor("ARTICULO_ID")} style={{ cursor: "pointer" }}>
                  ID {getIconoOrden("ARTICULO_ID")}
                </th>
                <th onClick={() => ordenarPor("NOMBRE")} style={{ cursor: "pointer" }}>
                  Nombre {getIconoOrden("NOMBRE")}
                </th>
                <th onClick={() => ordenarPor("CATEGORIA")} style={{ cursor: "pointer" }}>
                  Categoría {getIconoOrden("CATEGORIA")}
                </th>
                <th onClick={() => ordenarPor("PRECIOPROVEEDOR")} style={{ cursor: "pointer" }}>
                  Precio Proveedor {getIconoOrden("PRECIOPROVEEDOR")}
                </th>
                <th onClick={() => ordenarPor("PRECIOVENTA")} style={{ cursor: "pointer" }}>
                  Precio Venta {getIconoOrden("PRECIOVENTA")}
                </th>
                <th onClick={() => ordenarPor("GANANCIA")} style={{ cursor: "pointer" }}>
                  Ganancia {getIconoOrden("GANANCIA")}
                </th>
                <th onClick={() => ordenarPor("TEMPORADA")} style={{ cursor: "pointer" }}>
                  Temporada {getIconoOrden("TEMPORADA")}
                </th>
                <th>Acciones</th>
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
                  <td>${articulo.GANANCIA.toFixed(2)}</td>
                  <td>{articulo.TEMPORADA}</td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="warning" onClick={() => abrirModalEditar(articulo)}>
                      <FaEdit className="me-1" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => eliminarArticulo(articulo.ARTICULO_ID)}>
                      <FaTrash className="me-1" /> Eliminar
                    </Button>
                  </td>
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

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{modoEdicion ? "Editar" : "Agregar"} Artículo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {["NOMBRE", "CATEGORIA", "PRECIOPROVEEDOR", "PRECIOVENTA", "TEMPORADA"].map((campo, idx) => (
                <Form.Group className="mb-3" key={idx}>
                  <Form.Label>{campo.charAt(0) + campo.slice(1).toLowerCase()}</Form.Label>
                  <Form.Control
                    name={campo}
                    type={campo.includes("PRECIO") ? "number" : "text"}
                    value={nuevoArticulo[campo]}
                    onChange={handleChange}
                  />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={guardarArticulo}>
              {modoEdicion ? "Guardar Cambios" : "Agregar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Articulos;
