const controller = require('../controllers/pedidosProveedorController');
const { connection } = require('../config/db');

jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('pedidosProveedorController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { locationId: '123' }, body: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('getPedidosPendientesProveedor - éxito', async () => {
    connection.exec.mockImplementation((query, params, callback) => {
      callback(null, [{
        ID: 1,
        FECHA: '2025-06-01',
        SOLICITADOPOR: 'Juan',
        CORREOSOLICITANTE: 'juan@test.com',
        TOTAL: 200,
        ESTADO: 'Pendiente',
        FECHAESTIMADA: '2025-06-10',
        TIPOORDEN: 'Normal',
        DESCUENTO: 0,
        ORGANIZACION: 'Empresa SA'
      }]);
    });

    await controller.getPedidosPendientesProveedor(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  test('getPedidosPendientesProveedor - error de conexión', async () => {
    connection.exec.mockImplementation((query, params, callback) => {
      callback(new Error('DB error'), null);
    });

    await controller.getPedidosPendientesProveedor(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});