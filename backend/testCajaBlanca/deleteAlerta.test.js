


const { deleteAlerta } = require('../controllers/alertaController');
const { connection } = require("../config/db");


// Import necessary modules
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('deleteAlerta() deleteAlerta method', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      params: {
        id: '1'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy paths', () => {
    it('should delete an alert successfully and return a success message', async () => {
      // Arrange: Mock the database execution to simulate successful deletion
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      // Act: Call the deleteAlerta function
      await deleteAlerta(req, res);

      // Assert: Check if the response is as expected
      expect(connection.exec).toHaveBeenCalledWith(
        'DELETE FROM "DBADMIN"."ALERTAS2" WHERE "ALERTA_ID" = 1',
        [],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Alerta eliminada correctamente'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle SQL errors gracefully', async () => {
      // Arrange: Mock the database execution to simulate an SQL error
      const errorMessage = 'SQL error';
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error(errorMessage), null);
      });

      // Act: Call the deleteAlerta function
      await deleteAlerta(req, res);

      // Assert: Check if the error is handled correctly
      expect(connection.exec).toHaveBeenCalledWith(
        'DELETE FROM "DBADMIN"."ALERTAS2" WHERE "ALERTA_ID" = 1',
        [],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error al eliminar la alerta',
        details: errorMessage
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange: Simulate an unexpected error by throwing an error in the function
      const unexpectedError = new Error('Unexpected error');
      connection.exec.mockImplementation(() => {
        throw unexpectedError;
      });

      // Act: Call the deleteAlerta function
      await deleteAlerta(req, res);

      // Assert: Check if the unexpected error is handled correctly
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor',
        details: unexpectedError.message
      });
    });
  });
});