jest.mock('../config/db');
const dbMock = require('../config/db');
const controller = require('../controllers/alertaController');

let req;
let res;

beforeEach(() => {
  jest.clearAllMocks();
  req = { query: {}, body: {}, params: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
});

describe('Alertas Controller - Pruebas Unitarias', () => {

  describe('getAlertas', () => {
  it('retorna alertas procesadas correctamente', async () => {
    req.query = {};

    dbMock.connection.exec.mockImplementation((query, params, cb) => {
      cb(null, [{
        id: 1,
        descripcion: 'Orden ID 123 - Nueva orden creada por usuario ID 456',
        fecha: '2024-06-01',
        location_id: 2,
        prioridad: 1,
        orden_producto_id: 123
      }]);
    });

    await controller.getAlertas(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        id: 1,
        titulo: 'Nueva orden #123 creada',
        tipo: 'primary',
        orden_id: '123',
        usuario_id: '456',
        location_id: 2,
        descripcion: 'Orden ID 123 - Nueva orden creada por usuario ID 456',
        fecha: '2024-06-01'
      })
    ]));
  });

  it('retorna array vacío si no hay resultados', async () => {
    dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, []));
    await controller.getAlertas(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('maneja errores correctamente', async () => {
    dbMock.connection.exec.mockImplementation((q, p, cb) => cb(new Error('Error')));
    await controller.getAlertas(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener alertas' });
  });
});

  describe('createAlerta', () => {
    it('crea una alerta correctamente', async () => {
      req.body = {
        descripcion: 'Prueba alerta',
        location_id: 1,
        prioridad: 2,
        orden_producto_id: 5
      };

      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, { success: true }));

      await controller.createAlerta(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alerta creada correctamente' });
    });

    it('devuelve 400 si faltan campos obligatorios', async () => {
      req.body = {};
      await controller.createAlerta(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'La descripción y el location_id son obligatorios' });
    });

    it('maneja errores correctamente', async () => {
      req.body = {
        descripcion: 'Error test',
        location_id: 1
      };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(new Error('Error')));
      await controller.createAlerta(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear la alerta' });
    });
  });

  describe('deleteAlerta', () => {
    it('elimina alerta correctamente', async () => {
      req.params = { id: 1 };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, { success: true }));
      await controller.deleteAlerta(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alerta eliminada correctamente' });
    });

    it('maneja errores al eliminar', async () => {
      req.params = { id: 1 };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(new Error('Error')));
      await controller.deleteAlerta(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al eliminar la alerta' });
    });
  });

  describe('generarNotificacion', () => {
    it('crea notificación correctamente con ID', async () => {
      dbMock.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, { success: true })) // insert
        .mockImplementationOnce((q, p, cb) => cb(null, [{ ALERTAID: 7 }])); // select

      const result = await controller.generarNotificacion(
        'Descripción de prueba', 'Título prueba', 'info', 1, 10, 3
      );

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(7);
    });

    it('retorna mensaje sin ID si no se puede obtener', async () => {
      dbMock.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, { success: true })) // insert
        .mockImplementationOnce((q, p, cb) => cb(new Error('Error ID')));  // error en select

      const result = await controller.generarNotificacion(
        'Texto', 'Título', 'warning', 2
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('pero no se pudo obtener su ID');
    });

    it('rechaza si faltan campos obligatorios', async () => {
      await expect(controller.generarNotificacion(null, 'x', 'info', null))
        .rejects.toThrow('La descripción y el location_id son obligatorios');
    });

    it('rechaza si falla la inserción', async () => {
      dbMock.connection.exec.mockImplementationOnce((q, p, cb) => cb(new Error('DB error')));
      await expect(controller.generarNotificacion('Texto', 'x', 'info', 1))
        .rejects.toThrow('DB error');
    });
  });

});
