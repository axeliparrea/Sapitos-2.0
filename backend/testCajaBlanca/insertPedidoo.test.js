


const { insertPedido } = require('../controllers/pedidosController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the connection and generarNotificacion
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

jest.mock("../controllers/alertaController", () => ({
  generarNotificacion: jest.fn()
}));

describe('insertPedido() insertPedido method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        creadoPorId: 1,
        organizacion: 'Test Org',
        productos: [
          { articuloId: 1, cantidad: 10, precio: 100 }
        ],
        total: 1000,
        metodoPagoId: 1,
        descuentoAplicado: 0,
        tipoOrden: 'Compra'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    connection.exec.mockClear();
    generarNotificacion.mockClear();
  });

  // Happy Path Tests
  

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body.creadoPorId = undefined;

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "Datos incompletos para crear el pedido"
      }));
    });

    it('should return 400 if user does not exist', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => callback(null, [])); // User does not exist

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "El usuario especificado no existe"
      }));
    });

    it('should return 400 if payment method does not exist', async () => {
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ 1: 1 }])) // User exists
        .mockImplementationOnce((query, params, callback) => callback(null, [])); // Payment method does not exist

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "El método de pago especificado no existe"
      }));
    });

    it('should return 400 if no products can be inserted', async () => {
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ 1: 1 }])) // User exists
        .mockImplementationOnce((query, params, callback) => callback(null, [{ 1: 1 }])) // Payment method exists
        .mockImplementationOnce((query, params, callback) => callback(null, {})) // Insert order
        .mockImplementationOnce((query, params, callback) => callback(null, [{ ORDEN_ID: 1 }])) // Get order ID
        .mockImplementationOnce((query, params, callback) => callback(null, [{ 1: 1 }])) // Order exists
        .mockImplementationOnce((query, params, callback) => callback(null, [])); // Article does not exist

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "No se pudo insertar ningún producto"
      }));
    });

    it('should handle database errors gracefully', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => callback(new Error('Database error')));

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "Error al crear el pedido"
      }));
    });
  });
});