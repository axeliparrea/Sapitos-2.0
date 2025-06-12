


const { getLocaciones } = require('../controllers/inventoryController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('getLocaciones() getLocaciones method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy paths', () => {
    it('should return a list of locations when the query is successful', async () => {
      // Arrange: Mock the database response
      const mockResult = [
        { LOCATION_ID: 1, NOMBRE: 'Location A', TIPO: 'Warehouse', POSICIONX: 10, POSICIONY: 20, FECHACREADO: '2023-01-01' },
        { LOCATION_ID: 2, NOMBRE: 'Location B', TIPO: 'Store', POSICIONX: 30, POSICIONY: 40, FECHACREADO: '2023-02-01' }
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getLocaciones(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { locationId: 1, nombre: 'Location A', tipo: 'Warehouse', posicionX: 10, posicionY: 20, fechaCreado: '2023-01-01' },
        { locationId: 2, nombre: 'Location B', tipo: 'Store', posicionX: 30, posicionY: 40, fechaCreado: '2023-02-01' }
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should return an empty list when there are no locations', async () => {
      // Arrange: Mock the database response with an empty result
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getLocaciones(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock the database to return an error
      const mockError = new Error('Database error');
      connection.exec.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      // Act: Call the function
      await getLocaciones(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener las ubicaciones' });
    });
  });
});