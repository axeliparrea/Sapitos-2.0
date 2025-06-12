


const { getInventoryById } = require('../controllers/inventoryController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('getInventoryById() getInventoryById method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy paths', () => {
    it('should return inventory details for a valid ID', async () => {
      // Arrange: Mock the database response for a valid inventory ID
      const mockResult = [{
        INVENTARIO_ID: 1,
        ARTICULO_ID: 101,
        LOCATION_ID: 201,
        ARTICULONOMBRE: 'Articulo A',
        CATEGORIA: 'Categoria A',
        PRECIOPROVEEDOR: 100,
        PRECIOVENTA: 150,
        TEMPORADA: 'Verano',
        STOCKACTUAL: 50,
        STOCKMINIMO: 10,
        STOCKRECOMENDADO: 60,
        STOCKSEGURIDAD: 5,
        IMPORTACION: '2023-01-01',
        EXPORTACION: '2023-02-01',
        FECHAULTIMAIMPORTACION: '2023-01-01',
        FECHAULTIMAEXPORTACION: '2023-02-01',
        MARGENGANANCIA: 50,
        TIEMPOREPOSICION: 7,
        DEMANDAPROMEDIO: 5,
        LOCATIONNOMBRE: 'Oficina Central',
        LOCATIONTIPO: 'Oficina',
        POSICIONX: 10,
        POSICIONY: 20
      }];

      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getInventoryById(req, res);

      // Assert: Check if the response is as expected
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        inventarioId: 1,
        articuloId: 101,
        locationId: 201,
        nombre: 'Articulo A',
        categoria: 'Categoria A',
        precioProveedor: 100,
        precioVenta: 150,
        temporada: 'Verano',
        stockActual: 50,
        stockMinimo: 10,
        stockRecomendado: 60,
        stockSeguridad: 5,
        importacion: '2023-01-01',
        exportacion: '2023-02-01',
        fechaUltimaImportacion: '2023-01-01',
        fechaUltimaExportacion: '2023-02-01',
        margenGanancia: 50,
        tiempoReposicion: 7,
        demandaPromedio: 5,
        locationNombre: 'Oficina Central',
        locationTipo: 'Oficina',
        posicionX: 10,
        posicionY: 20
      });
    });
  });

  describe('Edge cases', () => {
    it('should return 404 if inventory ID does not exist', async () => {
      // Arrange: Mock the database response for a non-existent inventory ID
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getInventoryById(req, res);

      // Assert: Check if the response is as expected
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Inventario no encontrado' });
    });

    it('should return 500 if there is a database error', async () => {
      // Arrange: Mock a database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      await getInventoryById(req, res);

      // Assert: Check if the response is as expected
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener inventario' });
    });

    it('should return 500 if there is a general error', async () => {
      // Arrange: Simulate a general error by throwing an error
      connection.exec.mockImplementation(() => {
        throw new Error('General error');
      });

      // Act: Call the function
      await getInventoryById(req, res);

      // Assert: Check if the response is as expected
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});