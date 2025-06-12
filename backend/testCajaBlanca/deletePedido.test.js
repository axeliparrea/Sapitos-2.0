


const { deletePedido } = require('../controllers/pedidosController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the generarNotificacion function
jest.mock("../controllers/alertaController", () => {
  const originalModule = jest.requireActual("../controllers/alertaController");
  return {
    __esModule: true,
    ...originalModule,
    generarNotificacion: jest.fn(),
  };
});

// Mock the connection.exec function
jest.mock("../config/db", () => {
  const originalModule = jest.requireActual("../config/db");
  return {
    __esModule: true,
    ...originalModule,
    connection: {
      exec: jest.fn(),
    },
  };
});

describe('deletePedido() deletePedido method', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    connection.exec.mockClear();
  });

  describe('Happy paths', () => {
    it('should delete a pedido successfully when it exists', async () => {
      // Mock the database responses
      connection.exec.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT Orden_ID FROM Ordenes2')) {
          callback(null, [{ Orden_ID: 1 }]);
        } else {
          callback(null, {});
        }
      });

      await deletePedido(req, res);

      expect(connection.exec).toHaveBeenCalledTimes(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Pedido eliminado exitosamente" });
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if the ID is invalid', async () => {
      req.params.id = 'invalid';

      await deletePedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ID de pedido inválido" });
    });

    it('should return 404 if the pedido does not exist', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT Orden_ID FROM Ordenes2')) {
          callback(null, []);
        }
      });

      await deletePedido(req, res);

      expect(connection.exec).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Pedido no encontrado" });
    });

    it('should return 500 if there is a database error', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      await deletePedido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al eliminar el pedido" });
    });
  });
});