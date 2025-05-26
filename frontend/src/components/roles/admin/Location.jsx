import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5000/location2");
        setLocations(response.data);
      } catch (err) {
        console.error("Error al obtener ubicaciones:", err);
        setError("No se pudieron obtener las ubicaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="text-primary mb-4">Ubicaciones Registradas</h2>

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Fecha Creado</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.LOCATION_ID}>
                <td>{loc.LOCATION_ID}</td>
                <td>{loc.NOMBRE}</td>
                <td>{loc.TIPO}</td>
                <td>{loc.FECHACREADO}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Locations;
