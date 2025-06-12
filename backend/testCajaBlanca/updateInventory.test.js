


const { updateInventory } = require('../controllers/inventoryController');
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

describe('updateInventory() updateInventory method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      body: {
        stockActual: 50,
        stockMinimo: 20,
        stockRecomendado: 100,
        stockSeguridad: 10,
        margenGanancia: 30,
        tiempoReposicion: 5,
        demandaPromedio: 10,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    connection.exec.mockClear();
    generarNotificacion.mockClear();
  });

  describe('Happy paths', () => {
    it('should update inventory successfully when all fields are provided', async () => {
      // Mock the database response for inventory check
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ INVENTARIO_ID: '1', STOCKMINIMO: 20, DEMANDAPROMEDIO: 10, STOCKRECOMENDADO: 100 }]);
      });

      // Mock the database response for update
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await updateInventory(req, res);

      expect(connection.exec).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inventario actualizado exitosamente' });
    });

    it('should generate a notification if stockActual is below stockMinimo', async () => {
      req.body.stockActual = 15; // Set stockActual below stockMinimo

      // Mock the database response for inventory check
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ INVENTARIO_ID: '1', STOCKMINIMO: 20, DEMANDAPROMEDIO: 10, STOCKRECOMENDADO: 100, ARTICULONOMBRE: 'Articulo1', LOCATIONNOMBRE: 'Location1', LOCATION_ID: '1' }]);
      });

      // Mock the database response for update
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      await updateInventory(req, res);

      expect(generarNotificacion).toHaveBeenCalledWith(
        expect.stringContaining('Artículo Articulo1 en Location1 tiene stock bajo'),
        'Reabastecimiento necesario',
        'danger',
        '1'
      );
    });
  });

  describe('Edge cases', () => {
    it('should return 404 if inventory is not found', async () => {
      // Mock the database response for inventory check
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      await updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
    });

    it('should return 400 if no fields are provided for update', async () => {
      req.body = {}; // No fields provided

      // Mock the database response for inventory check
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ INVENTARIO_ID: '1' }]);
      });

      await updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se especificaron campos para actualizar' });
    });

    it('should handle database errors gracefully', async () => {
      // Mock the database response for inventory check with an error
      connection.exec.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar el inventario', detalle: 'Database error' });
    });
  });
});