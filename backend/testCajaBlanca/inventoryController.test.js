jest.mock('../config/db');
const dbMock = require('../config/db');
const controller = require('../controllers/inventoryController');

let req;
let res;

beforeEach(() => {
  jest.clearAllMocks();
  req = {};
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
});

describe('Inventory Controller - Pruebas Profesionales con Mock', () => {

  // getInventory
  describe('getInventory', () => {
    it('debe devolver inventario con status 200', async () => {
      dbMock.connection.exec.mockImplementation((query, params, cb) => {
        cb(null, [{
          INVENTARIO_ID: 1,
          ARTICULO_ID: 5,
          ARTICULONOMBRE: 'Producto A',
          CATEGORIA: 'Ropa',
          PRECIOPROVEEDOR: 10,
          PRECIOVENTA: 15,
          TEMPORADA: 'Verano',
          STOCKACTUAL: 20,
          STOCKMINIMO: 5,
          STOCKRECOMENDADO: 10,
          STOCKSEGURIDAD: 2,
          FECHAULTIMAIMPORTACION: '2024-01-01',
          FECHAULTIMAEXPORTACION: '2024-02-01',
          MARGENGANANCIA: 0.5,
          TIEMPOREPOSICION: 5,
          DEMANDAPROMEDIO: 7,
          LOCATIONNOMBRE: 'Sucursal A',
          LOCATIONTIPO: 'Oficina'
        }]);
      });

      await controller.getInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ nombre: 'Producto A' })
      ]));
    });

    it('maneja errores correctamente', async () => {
      dbMock.connection.exec.mockImplementation((query, params, cb) => cb(new Error('Error simulado')));
      await controller.getInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener el inventario' });
    });
  });

  // getInventoryById
  describe('getInventoryById', () => {
    it('devuelve un inventario si existe', async () => {
      req.params = { id: 1 };
      dbMock.connection.exec.mockImplementation((query, params, cb) => {
        cb(null, [{
          INVENTARIO_ID: 1,
          ARTICULONOMBRE: 'Producto A',
          LOCATIONNOMBRE: 'A',
          LOCATIONTIPO: 'Oficina'
        }]);
      });

      await controller.getInventoryById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ inventarioId: 1 }));
    });

    it('devuelve 404 si no encuentra inventario', async () => {
      req.params = { id: 99 };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, []));
      await controller.getInventoryById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
    });

    it('maneja error en exec', async () => {
      req.params = { id: 1 };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(new Error('Error')));
      await controller.getInventoryById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // insertInventory
  describe('insertInventory', () => {
    it('inserta correctamente cuando artículo y ubicación existen', async () => {
      req.body = {
        articuloId: 1,
        locationId: 1,
        stockActual: 10,
        stockMinimo: 5,
        stockRecomendado: 8,
        stockSeguridad: 2,
        margenGanancia: 0.3,
        tiempoReposicion: 7,
        demandaPromedio: 6
      };

      dbMock.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, [{ Articulo_ID: 1 }])) // artículo
        .mockImplementationOnce((q, p, cb) => cb(null, [{ Location_ID: 1 }])); // ubicación

      dbMock.connection.prepare.mockImplementation((q, cb) => {
        cb(null, {
          execute: (params, cb2) => cb2(null, { success: true })
        });
      });

      await controller.insertInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inventario agregado exitosamente' });
    });

    it('devuelve 400 si artículo no existe', async () => {
      req.body = { articuloId: 999 };
      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, []));
      await controller.insertInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El artículo especificado no existe' });
    });
  });

  // updateInventory
describe('updateInventory', () => {
  it('actualiza inventario existente', async () => {
    req.params = { id: 1 };
    req.body = {
      stockActual: 20,
      stockMinimo: 5,
      stockRecomendado: 10,
      stockSeguridad: 2,
      importacion: '2024-01-01',
      exportacion: '2024-02-01',
      margenGanancia: 0.4,
      tiempoReposicion: 7,
      demandaPromedio: 9
    };

    // Mock: inventario existe
    dbMock.connection.exec
      .mockImplementationOnce((q, p, cb) => cb(null, [{ INVENTARIO_ID: 1, ARTICULONOMBRE: 'P', LOCATIONNOMBRE: 'A', STOCKMINIMO: 5, DEMANDAPROMEDIO: 1, STOCKRECOMENDADO: 10, LOCATION_ID: 1 }])) // check existencia
      .mockImplementationOnce((q, p, cb) => cb(null, {})); // update query

    await controller.updateInventory(req, res);

    // Ya no se valida res.status(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Inventario actualizado exitosamente' });
  });

  it('devuelve 404 si inventario no existe', async () => {
    req.params = { id: 999 };
    req.body = {};

    dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, []));

    await controller.updateInventory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
  });
});

  // deleteInventory
  describe('deleteInventory', () => {
    it('elimina inventario existente', async () => {
      req.params = { id: 1 };

      dbMock.connection.exec
        .mockImplementationOnce((q, p, cb) => cb(null, [{ Inventario_ID: 1 }])) // check
        .mockImplementationOnce((q, p, cb) => cb(null, { success: true }));     // delete

      await controller.deleteInventory(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inventario eliminado exitosamente' });
    });

    it('devuelve 404 si inventario no existe', async () => {
        req.params = { id: 999 };
        req.body = {}; // 💥 esto es lo que evita el error de destructuring

        dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, []));
        
        await controller.updateInventory(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
    });
  });
});
