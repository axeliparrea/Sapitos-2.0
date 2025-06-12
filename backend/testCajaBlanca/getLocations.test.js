


const { getLocations } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getLocations() getLocations method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return a list of locations when the query is successful', async () => {
      // Arrange: Mock the database response
      const mockLocations = [
        { LOCATION_ID: 1, NOMBRE: 'Location A', TIPO: 'Type 1' },
        { LOCATION_ID: 2, NOMBRE: 'Location B', TIPO: 'Type 2' },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockLocations);
      });

      // Act: Call the function
      await getLocations(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { Location_ID: 1, Nombre: 'Location A', Tipo: 'Type 1' },
        { Location_ID: 2, Nombre: 'Location B', Tipo: 'Type 2' },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should return a 404 error when no locations are found', async () => {
      // Arrange: Mock the database response with no results
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getLocations(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se encontraron ubicaciones' });
    });

    it('should return a 500 error when there is a database error', async () => {
      // Arrange: Mock a database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      await getLocations(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener ubicaciones' });
    });
  });
});