


const { insertPedido } = require('../controllers/pedidosController');
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
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('insertPedido() insertPedido method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        creadoPorId: 1,
        organizacion: 'Test Org',
        productos: [{ articuloId: 1, cantidad: 10, precio: 100 }],
        total: 1000,
        metodoPagoId: 1,
        descuentoAplicado: 0,
        tipoOrden: 'Compra',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    connection.exec.mockClear();
    generarNotificacion.mockClear();
  });



  describe('Edge cases', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body.creadoPorId = undefined;

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos incompletos para crear el pedido',
        detalles: {
          creadoPorId: 'Faltante',
          organizacion: 'OK',
          productos: 'OK',
          total: 'OK',
        },
      });
    });

    it('should return 400 if user does not exist', async () => {
      connection.exec.mockImplementationOnce((query, params, callback) => callback(null, []));

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El usuario especificado no existe',
        creadoPorId: 1,
      });
    });

    it('should return 400 if payment method does not exist', async () => {
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ 1: 1 }])) // User exists
        .mockImplementationOnce((query, params, callback) => callback(null, [])); // Payment method does not exist

      await insertPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El método de pago especificado no existe',
        metodoPagoId: 1,
      });
    });
  });
});