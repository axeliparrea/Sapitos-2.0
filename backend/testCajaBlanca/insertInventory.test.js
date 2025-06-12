


const { insertInventory } = require('../controllers/inventoryController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Sapitos-2.0/backend/controllers/inventoryController.test.js
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
    prepare: jest.fn(),
  },
}));

jest.mock("../controllers/alertaController", () => ({
  generarNotificacion: jest.fn(),
}));

describe('insertInventory() insertInventory method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        articuloId: 1,
        locationId: 1,
        stockActual: 100,
        stockMinimo: 50,
        stockRecomendado: 150,
        stockSeguridad: 30,
        margenGanancia: 20,
        tiempoReposicion: 5,
        demandaPromedio: 10,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    connection.exec.mockClear();
    connection.prepare.mockClear();
    generarNotificacion.mockClear();
  });

  describe('Happy paths', () => {
    it('should insert inventory successfully when all inputs are valid', async () => {
      // Mock successful article and location checks
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Articulo_ID: 1 }]))
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Location_ID: 1 }]));

      // Mock successful insert
      connection.prepare.mockImplementation((query, callback) => {
        const statement = {
          execute: (params, callback) => callback(null, { affectedRows: 1 }),
        };
        callback(null, statement);
      });

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inventario agregado exitosamente' });
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if the article does not exist', async () => {
      // Mock article not found
      connection.exec.mockImplementationOnce((query, params, callback) => callback(null, []));

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El artículo especificado no existe' });
    });

    it('should return 400 if the location does not exist', async () => {
      // Mock successful article check
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Articulo_ID: 1 }]))
        .mockImplementationOnce((query, params, callback) => callback(null, []));

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'La ubicación especificada no existe' });
    });

    it('should return 500 if there is an error verifying the article', async () => {
      // Mock error during article check
      connection.exec.mockImplementationOnce((query, params, callback) => callback(new Error('DB error')));

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al verificar el artículo' });
    });

    it('should return 500 if there is an error verifying the location', async () => {
      // Mock successful article check and error during location check
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Articulo_ID: 1 }]))
        .mockImplementationOnce((query, params, callback) => callback(new Error('DB error')));

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al verificar la ubicación' });
    });

    it('should return 500 if there is an error preparing the insert statement', async () => {
      // Mock successful article and location checks
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Articulo_ID: 1 }]))
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Location_ID: 1 }]));

      // Mock error during statement preparation
      connection.prepare.mockImplementation((query, callback) => callback(new Error('Prepare error')));

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al preparar la consulta' });
    });

    it('should return 500 if there is an error executing the insert statement', async () => {
      // Mock successful article and location checks
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Articulo_ID: 1 }]))
        .mockImplementationOnce((query, params, callback) => callback(null, [{ Location_ID: 1 }]));

      // Mock error during statement execution
      connection.prepare.mockImplementation((query, callback) => {
        const statement = {
          execute: (params, callback) => callback(new Error('Execute error')),
        };
        callback(null, statement);
      });

      await insertInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al insertar datos en inventario' });
    });
  });
});