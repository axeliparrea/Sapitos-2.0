const pedidosProveedorController = require('../controllers/pedidosProveedorController');
const db = require('../config/db');

jest.mock('../config/db', () => {
  const exec = jest.fn();
  const connection = { exec };
  return { connection };
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Pedidos Proveedor Controller - Pruebas Profesionales con Mock', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPedidosPendientesProveedor', () => {
    it('debe devolver lista de pedidos con status 200', async () => {
      const req = {};
      const res = mockRes();
      const mockData = [{
        ID: 1,
        FECHA: '2024-01-01',
        SOLICITADOPOR: 'Juan',
        CORREOSOLICITANTE: 'juan@test.com',
        TOTAL: 100,
        ESTADO: 'Pendiente',
        FECHAESTIMADA: '2024-01-10',
        TIPOORDEN: 'Normal',
        DESCUENTO: 0
      }];

      db.connection.exec.mockImplementation((query, params, cb) => cb(null, mockData));

      await pedidosProveedorController.getPedidosPendientesProveedor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('debe manejar error en exec', async () => {
      const req = {};
      const res = mockRes();

      db.connection.exec.mockImplementation((query, params, cb) => cb(new Error('Error DB')));

      await pedidosProveedorController.getPedidosPendientesProveedor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getInventarioProveedor', () => {
    it('debe devolver inventario si hay locationId', async () => {
      const req = { params: { locationId: '1' } };
      const res = mockRes();
      db.connection.exec.mockImplementation((query, params, cb) => cb(null, [{ id: 1 }]));

      await pedidosProveedorController.getInventarioProveedor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe manejar error si no hay locationId', async () => {
      const req = { params: {} };
      const res = mockRes();

      await pedidosProveedorController.getInventarioProveedor(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('aceptarPedido', () => {
    it('debe aceptar pedido pendiente y actualizar estado', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();
      const estado = { ESTADO: 'Pendiente' };

      db.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, [estado])) // checkQuery
        .mockImplementationOnce((q, p, cb) => cb(null, {})); // updateQuery

      await pedidosProveedorController.aceptarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debe rechazar si el estado no es Pendiente', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      db.connection.exec.mockImplementation((q, p, cb) => cb(null, [{ ESTADO: 'Aprobado' }]));

      await pedidosProveedorController.aceptarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('rechazarPedido', () => {
    it('rechaza pedido correctamente', async () => {
      const req = { params: { id: '2' }, body: { motivo: 'No disponible' } };
      const res = mockRes();

      db.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, [{ Estado: 'Pendiente' }]))
        .mockImplementationOnce((q, p, cb) => cb(null, {}));

      await pedidosProveedorController.rechazarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getDetallePedido', () => {
    it('debe devolver detalles del pedido', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();
      db.connection.exec.mockImplementation((q, p, cb) => cb(null, [{ articuloId: 1 }]));

      await pedidosProveedorController.getDetallePedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('maneja error si no hay ID', async () => {
      const req = { params: {} };
      const res = mockRes();

      await pedidosProveedorController.getDetallePedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('enviarPedido', () => {
    it('maneja error si estado no es Aprobado', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      db.connection.exec.mockImplementationOnce((q, p, cb) => cb(null, [{ Estado: 'Pendiente' }]));

      await pedidosProveedorController.enviarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('maneja error si no se encuentra pedido', async () => {
      const req = { params: { id: '1' } };
      const res = mockRes();

      db.connection.exec.mockImplementationOnce((q, p, cb) => cb(null, []));

      await pedidosProveedorController.enviarPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

});
