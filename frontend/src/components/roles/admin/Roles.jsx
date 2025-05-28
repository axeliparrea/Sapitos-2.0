import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/rol2");
        setRoles(response.data);
      } catch (err) {
        console.error("Error al obtener roles:", err);
        setError("No se pudieron obtener los roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div style={{ width: "400px" }}>
        <h4 className="text-primary mb-4 text-center">Lista de Roles</h4>

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <Table striped bordered hover size="sm" className="table-sm">
            <thead>
              <tr>
                <th>ROL_ID</th>
                <th>Nombre del Rol</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol.ROL_ID}>
                  <td>{rol.ROL_ID}</td>
                  <td>{rol.NOMBRE}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default Roles;
