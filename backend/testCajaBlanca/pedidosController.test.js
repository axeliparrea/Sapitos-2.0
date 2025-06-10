
const controller = require('../controllers/pedidosController');
const { connection } = require('../config/db');

jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('pedidosController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPedido', () => {
    it('should return formatted order list', async () => {
      const req = {};
      const res = mockRes();
      connection.exec.mockImplementation((query, params, cb) => {
        cb(null, [{
          ID: 1,
          CORREO_CREADOR: 'test@example.com',
          CREADO_POR_NOMBRE: 'Test User',
          Organizacion: 'TestOrg',
          TipoOrden: 'Compra',
          FECHACREACION: '2025-06-01',
          FECHAACEPTACION: null,
          FECHAESTIMAPAGO: null,
          FECHAESTIMAENTREGA: null,
          FECHAENTREGA: null,
          ENTREGAATIEMPO: null,
          ESTATUS: 'Pendiente',
          TOTAL: 1500,
          METODOPAGO: 'Transferencia',
          DESCUENTOAPLICADO: 0,
          TIEMPOREPOSICION: null,
          TIEMPOENTREGA: null
        }]);
      });

      await controller.getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          creadaPor: 'test@example.com',
          creadoPorNombre: 'Test User',
          organizacion: 'TestOrg'
        })
      ]));
    });

    it('should handle database error', async () => {
      const req = {};
      const res = mockRes();
      connection.exec.mockImplementation((query, params, cb) => {
        cb(new Error('DB error'), null);
      });

      await controller.getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Error al obtener los pedidos'
      }));
    });
  });
});
