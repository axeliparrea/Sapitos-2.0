


const { getAlertas } = require('../controllers/alertaController');
const { connection } = require("../config/db");


// Import necessary modules
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('getAlertas() getAlertas method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy Paths', () => {
    it('should return a list of alertas when location_id is provided in query', async () => {
      // Arrange
      req.query.location_id = '1';
      const mockResults = [
        { ID: 1, DESCRIPCION: 'Test Alerta', FECHA: '2023-10-01T00:00:00Z', ORDEN_ID: 101, LOCATION_ID: 1, PRIORIDAD: 'ALTA' }
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      // Act
      await getAlertas(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          tipo: 'danger',
          titulo: 'Alerta',
          descripcion: 'Test Alerta',
          fecha: '2023-10-01T00:00:00Z',
          orden_id: 101,
          location_id: 1,
          prioridad: 'ALTA'
        })
      ]));
    });

    it('should return an empty array when no alertas are found', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act
      await getAlertas(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle SQL errors gracefully', async () => {
      // Arrange
      const mockError = new Error('SQL Error');
      connection.exec.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      // Act
      await getAlertas(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error en la consulta SQL',
        details: 'SQL Error'
      });
    });

    it('should handle invalid date formats by setting the date to current date', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 1000000000).toISOString();
      const mockResults = [
        { ID: 1, DESCRIPCION: 'Test Alerta', FECHA: futureDate, ORDEN_ID: 101, LOCATION_ID: 1, PRIORIDAD: 'ALTA' }
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      // Act
      await getAlertas(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          fecha: expect.any(String) // Check that the date is a valid string
        })
      ]));
    });

    it('should default to "primary" type when no priority or description matches', async () => {
      // Arrange
      const mockResults = [
        { ID: 1, DESCRIPCION: 'Neutral Alerta', FECHA: '2023-10-01T00:00:00Z', ORDEN_ID: 101, LOCATION_ID: 1, PRIORIDAD: 'NEUTRAL' }
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      // Act
      await getAlertas(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          tipo: 'primary'
        })
      ]));
    });
  });
});