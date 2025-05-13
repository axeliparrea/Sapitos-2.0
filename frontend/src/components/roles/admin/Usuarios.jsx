import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Container, Row, Col, Card, Button, Form, Modal, 
  InputGroup, Badge, Spinner, Alert, ListGroup
} from "react-bootstrap";
import { 
    FaUserPlus, FaSearch, FaEdit, FaTrash, FaUser, FaEnvelope, 
    FaBuilding, FaShieldAlt, FaTimes, FaSave, FaUsers, FaCalendar, FaDollarSign 
  } from "react-icons/fa";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ 
    nombre: "", 
    correo: "", 
    organizacion: "", 
    contrasena: "", 
    rol: "",
    diasordenprom: 0, 
    valorordenprom: 0
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Solicitando usuarios al backend...");
      const response = await axios.get('http://localhost:5000/users/getUsers');
      console.log("Respuesta recibida:", response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Datos recibidos:", response.data);
        setUsuarios(response.data);
      } else {
        console.log("Formato inesperado:", response.data);
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError('Error al obtener usuarios: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (modalMode === "edit") {
      setUsuarioEditando({ ...usuarioEditando, [e.target.name]: e.target.value });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    }
  };

  const agregarUsuario = async () => {
    try {
      await axios.post('http://localhost:5000/users/register', nuevoUsuario); 
      setNuevoUsuario({ 
        nombre: "", 
        correo: "", 
        organizacion: "", 
        contrasena: "", 
        rol: "",
        diasordenprom: 0, 
        valorordenprom: 0
      });
      setShowModal(false);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      setError('Error al agregar usuario: ' + (error.response?.data?.error || error.message));
    }
  };

  const eliminarUsuario = async (correo) => {
    try {
      await axios.delete('http://localhost:5000/users/deleteUser', { data: { correo } });
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  const activarEdicion = (usuario) => {
    setModalMode("edit");
    setUsuarioEditando({ ...usuario });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setNuevoUsuario({ 
      nombre: "", 
      correo: "", 
      organizacion: "", 
      contrasena: "", 
      rol: "" 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setUsuarioEditando(null);
  };

  const guardarCambios = async () => {
    try {
      await axios.put('http://localhost:5000/users/updateUser', usuarioEditando);
      setShowModal(false);
      setUsuarioEditando(null);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const usuariosFiltrados = Array.isArray(usuarios) ? usuarios.filter(usuario =>
    usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario?.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario?.rol && usuario?.rol.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const getBadgeVariant = (rol) => {
    switch(rol?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'proveedor': return 'success';
      case 'cliente': return 'info';
      case 'dueno': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="display-5 fw-bold text-primary d-flex align-items-center">
              <FaUsers className="me-3" /> 
              Gestión de Usuarios
            </h1>
            <p className="text-muted">Administra los usuarios del sistema</p>
          </Col>
          <Col xs="auto">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={openAddModal}
              className="d-flex align-items-center shadow-sm"
            >
              <FaUserPlus className="me-2" /> Agregar Usuario
            </Button>
          </Col>
        </Row>

        {/* Barra de búsqueda */}
        <Card className="shadow-sm mb-4 border-0">
          <Card.Body>
            <InputGroup>
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
          </Card.Body>
        </Card>

        {/* Estado de carga y error */}
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

        {/* Lista de usuarios */}
        {!loading && (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <Col key={usuario.correo}>
                  <Card className="h-100 shadow-sm border-top border-primary border-4 hover-shadow">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                            <FaUser className="text-primary" />
                          </div>
                          <Card.Title className="mb-0 fs-5">{usuario?.nombre}</Card.Title>
                        </div>
                        <div>
                          <Badge bg={getBadgeVariant(usuario?.rol)} className="ms-2">
                            {usuario.rol || "Sin rol"}
                          </Badge>
                        </div>
                      </div>
                      
                      <ListGroup variant="flush" className="small">
                        <ListGroup.Item className="d-flex align-items-center px-0">
                          <FaEnvelope className="text-muted me-2" />
                          <span className="text-truncate">{usuario.correo}</span>
                        </ListGroup.Item>
                        
                        <ListGroup.Item className="d-flex align-items-center px-0">
                          <FaBuilding className="text-muted me-2" />
                          <span>{usuario.organizacion || "No especificada"}</span>
                        </ListGroup.Item>
                      </ListGroup>
                      
                      <div className="d-flex justify-content-end mt-3 gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => activarEdicion(usuario)}
                          className="d-flex align-items-center"
                        >
                          <FaEdit className="me-1" /> Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => eliminarUsuario(usuario.correo)}
                          className="d-flex align-items-center"
                        >
                          <FaTrash className="me-1" /> Eliminar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Card className="text-center py-5 shadow-sm border-0">
                  <Card.Body>
                    <FaSearch className="display-1 text-muted mb-3" />
                    <Card.Title>No se encontraron usuarios</Card.Title>
                    <Card.Text className="text-muted">
                      No hay usuarios que coincidan con tu búsqueda o no hay usuarios registrados.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </Container>

      {/* Modal para agregar/editar usuario */}
      <Modal 
        show={showModal} 
        onHide={closeModal}
        centered
        size="lg"
        backdrop="static"
        className="user-modal"
      >
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>
            {modalMode === "edit" 
              ? <><FaEdit className="me-2" /> Editar Usuario</> 
              : <><FaUserPlus className="me-2" /> Agregar Usuario</>}
          </Modal.Title>
          <Button 
            variant="link" 
            className="text-white ms-auto" 
            onClick={closeModal}
            style={{ fontSize: '1.5rem', textDecoration: 'none' }}
          >
            <FaTimes className="text-white" />
          </Button>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formNombre">
                  <Form.Label>Nombre</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaUser /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="nombre"
                      placeholder="Nombre completo"
                      value={modalMode === "edit" ? usuarioEditando?.nombre : nuevoUsuario?.nombre}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formCorreo">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="correo"
                      placeholder="correo@ejemplo.com"
                      value={modalMode === "edit" ? usuarioEditando?.correo : nuevoUsuario?.correo}
                      onChange={handleInputChange}
                      disabled={modalMode === "edit"}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formRol">
                  <Form.Label>Rol</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaShieldAlt /></InputGroup.Text>
                    <Form.Select
                      name="rol"
                      value={modalMode === "edit" ? usuarioEditando.rol : nuevoUsuario.rol}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="admin">Admin</option>
                      <option value="proveedor">Proveedor</option>
                      <option value="cliente">Cliente</option>
                      <option value="dueno">Dueño</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formOrganizacion">
                  <Form.Label>Organización</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaBuilding /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="organizacion"
                      placeholder="Nombre de la organización"
                      value={modalMode === "edit" ? usuarioEditando.organizacion : nuevoUsuario.organizacion}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formDiasOrdenProm">
                    <Form.Label>Días Orden Promedio</Form.Label>
                    <InputGroup>
                        <InputGroup.Text><FaCalendar /></InputGroup.Text>
                        <Form.Control
                        type="number"
                        name="diasordenprom"
                        placeholder="Días de orden promedio"
                        value={modalMode === "edit" ? usuarioEditando?.diasordenprom : nuevoUsuario.diasordenprom}
                        onChange={handleInputChange}
                        />
                    </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="formValorOrdenProm">
                    <Form.Label>Valor Orden Promedio</Form.Label>
                    <InputGroup>
                        <InputGroup.Text><FaDollarSign /></InputGroup.Text>
                        <Form.Control
                        type="number"
                        name="valorordenprom"
                        placeholder="Valor de orden promedio"
                        value={modalMode === "edit" ? usuarioEditando?.valorordenprom : nuevoUsuario.valorordenprom}
                        onChange={handleInputChange}
                        />
                    </InputGroup>
                    </Form.Group>

              </Col>
            </Row>

            {modalMode === "add" && (
              <Form.Group className="mb-3" controlId="formContrasena">
                <Form.Label>Contraseña</Form.Label>
                <InputGroup>
                  <InputGroup.Text><i className="bi bi-lock-fill"></i></InputGroup.Text>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    placeholder="Contraseña"
                    value={nuevoUsuario.contrasena}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </Form.Group>

            
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-0">
          {modalMode === "edit" ? (
            <Button 
              variant="success" 
              onClick={guardarCambios}
              className="d-flex align-items-center"
            >
              <FaSave className="me-2" /> Guardar Cambios
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={agregarUsuario}
              className="d-flex align-items-center px-4 py-2"
            >
              <FaUserPlus className="me-2" /> Agregar
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    
    </div>
  );
};

export default Usuarios;