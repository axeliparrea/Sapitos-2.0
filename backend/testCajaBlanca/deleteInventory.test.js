


const { deleteInventory } = require('../controllers/inventoryController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('deleteInventory() deleteInventory method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should delete inventory successfully when inventory exists', async () => {
      // Mock the database response for checking inventory existence
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ Inventario_ID: '1' }]);
      });

      // Mock the database response for deleting inventory
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      // Call the deleteInventory function
      await deleteInventory(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inventario eliminado exitosamente' });
    });
  });

  describe('Edge cases', () => {
    it('should return 404 if inventory does not exist', async () => {
      // Mock the database response for checking inventory existence
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      // Call the deleteInventory function
      await deleteInventory(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
    });

    it('should return 500 if there is an error checking inventory existence', async () => {
      // Mock the database response with an error
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Call the deleteInventory function
      await deleteInventory(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al verificar el inventario' });
    });

    it('should return 500 if there is an error deleting the inventory', async () => {
      // Mock the database response for checking inventory existence
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ Inventario_ID: '1' }]);
      });

      // Mock the database response with an error for deleting inventory
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Call the deleteInventory function
      await deleteInventory(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar el inventario' });
    });
  });
});