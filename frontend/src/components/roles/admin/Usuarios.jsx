import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Table, Spinner, Alert, Form, InputGroup, Button, Modal
} from "react-bootstrap";
import {
  FaSearch, FaTimes, FaUserPlus
} from "react-icons/fa";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [locations, setLocations] = useState({});
  const [rolesMap, setRolesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    Nombre: "",
    Correo: "",
    Clave: "",
    Location_ID: "",
    Rol_ID: "",
    RFC: "",
    Username: "",
    FechaEmpiezo: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchUsuariosYLocations = async () => {
      setLoading(true);
      try {
        const [usuariosRes, locationsRes, rolesRes] = await Promise.all([
          axios.get("http://localhost:5000/usuario2/getUsuario"),
          axios.get("http://localhost:5000/location2/"),
          axios.get("http://localhost:5000/rol2")
        ]);

        const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : [usuariosRes.data];

        const locationsMap = {};
        locationsRes.data.forEach(loc => {
          locationsMap[loc.LOCATION_ID] = loc.NOMBRE;
        });

        const rolesMapTemp = {};
        rolesRes.data.forEach(role => {
          rolesMapTemp[role.ROL_ID] = role.NOMBRE;
        });

        setUsuarios(usuariosData);
        setLocations(locationsMap);
        setRolesMap(rolesMapTemp);
      } catch (err) {
        console.error("Error al obtener usuarios o locations:", err);
        setError("No se pudieron obtener los datos de usuarios o locations");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuariosYLocations();
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nombre = usuario?.NOMBRE?.toLowerCase() || "";
    const correo = usuario?.CORREO?.toLowerCase() || "";
    const rol = rolesMap[usuario?.ROL_ID]?.toLowerCase() || "";
    return (
      nombre.includes(searchTerm.toLowerCase()) ||
      correo.includes(searchTerm.toLowerCase()) ||
      rol.includes(searchTerm.toLowerCase())
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:5000/usuario2", nuevoUsuario);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario");
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary">Gestión de Usuarios</h1>
          <Button variant="success" onClick={() => setShowModal(true)}>
            <FaUserPlus className="me-2" /> Agregar Usuario
          </Button>
        </div>

        <InputGroup className="mb-3">
          <InputGroup.Text className="bg-white">
            <FaSearch className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Buscar usuarios por nombre, correo o rol..."
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
            <p className="text-muted">Cargando usuarios...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && usuariosFiltrados.length > 0 && (
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Usuario_ID</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Correo</th>
                <th>Location</th>
                <th>FechaCreado</th>
                <th>RFC</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.USUARIO_ID}>
                  <td>{usuario.USUARIO_ID}</td>
                  <td>{usuario.NOMBRE}</td>
                  <td>{rolesMap[usuario.ROL_ID]}</td>
                  <td>{usuario.CORREO}</td>
                  <td>{locations[usuario.LOCATION_ID] || "-"}</td>
                  <td>{usuario.FECHAEMPIEZO}</td>
                  <td>{usuario.RFC}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {!loading && usuariosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            No hay usuarios que coincidan con la búsqueda.
          </Alert>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="Nombre"
                  value={nuevoUsuario.Nombre}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  name="Correo"
                  value={nuevoUsuario.Correo}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  name="Clave"
                  value={nuevoUsuario.Clave}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>RFC</Form.Label>
                <Form.Control
                  type="text"
                  name="RFC"
                  value={nuevoUsuario.RFC}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="Username"
                  value={nuevoUsuario.Username}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Select
                  name="Location_ID"
                  value={nuevoUsuario.Location_ID}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una ubicación</option>
                  {Object.entries(locations).map(([id, nombre]) => (
                    <option key={id} value={id}>{nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  name="Rol_ID"
                  value={nuevoUsuario.Rol_ID}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione un rol</option>
                  {Object.entries(rolesMap).map(([id, nombre]) => (
                    <option key={id} value={id}>{nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>Guardar</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Usuarios;
