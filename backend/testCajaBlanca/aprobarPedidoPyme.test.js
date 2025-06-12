


const { aprobarPedidoPyme } = require('../controllers/pedidosPymesController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the connection and generarNotificacion
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

jest.mock("../controllers/alertaController", () => ({
  generarNotificacion: jest.fn(),
}));

describe('aprobarPedidoPyme() aprobarPedidoPyme method', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should approve a valid PYME order with status "Pendiente"', async () => {
      // Mock the database response for a valid order
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ TIPOORDEN: 'PYME', ESTADO: 'Pendiente', ORGANIZACION: 'TestOrg' }]);
      });

      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Pedido PYME aceptado exitosamente",
        nuevoEstado: "En Reparto",
        fechaEstimadaEntrega: "7 días desde hoy",
      });
      expect(generarNotificacion).toHaveBeenCalledWith(
        'Pedido PYME #1 de TestOrg ha sido aprobado',
        'Pedido PYME Aprobado',
        'success',
        1,
        '1'
      );
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if ID is invalid', async () => {
      req.params.id = 'invalid';

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ID de pedido inválido" });
    });

    it('should return 404 if order is not found', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Pedido no encontrado" });
    });

    it('should return 400 if order is not of type PYME', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ TIPOORDEN: 'OTHER', ESTADO: 'Pendiente' }]);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Este pedido no es de tipo PYME" });
    });

    it('should return 400 if order status is not "Pendiente"', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ TIPOORDEN: 'PYME', ESTADO: 'En Reparto' }]);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Solo se pueden aceptar pedidos en estado Pendiente" });
    });

    it('should return 500 if there is a database error during verification', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al verificar el pedido" });
    });

    it('should return 500 if there is a database error during update', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ TIPOORDEN: 'PYME', ESTADO: 'Pendiente' }]);
      });

      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await aprobarPedidoPyme(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al aceptar el pedido" });
    });
  });
});