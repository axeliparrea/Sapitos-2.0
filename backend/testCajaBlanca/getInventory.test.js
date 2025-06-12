


const { getInventory } = require('../controllers/inventoryController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Sapitos-2.0/backend/controllers/inventoryController.test.js
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getInventory() getInventory method', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return formatted inventory data when query is successful', async () => {
      // Arrange: Mock the database response
      const mockResult = [
        {
          INVENTARIO_ID: 1,
          ARTICULO_ID: 101,
          ARTICULONOMBRE: 'Articulo A',
          CATEGORIA: 'Categoria A',
          PRECIOPROVEEDOR: 100,
          PRECIOVENTA: 150,
          TEMPORADA: 'Verano',
          STOCKACTUAL: 50,
          STOCKMINIMO: 10,
          STOCKRECOMENDADO: 60,
          STOCKSEGURIDAD: 5,
          FECHAULTIMAIMPORTACION: '2023-01-01',
          FECHAULTIMAEXPORTACION: '2023-02-01',
          MARGENGANANCIA: 50,
          TIEMPOREPOSICION: 7,
          DEMANDAPROMEDIO: 5,
          LOCATIONNOMBRE: 'Oficina Central',
          LOCATIONTIPO: 'Oficina',
        },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getInventory(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          inventarioId: 1,
          articuloId: 101,
          nombre: 'Articulo A',
          categoria: 'Categoria A',
          precioProveedor: 100,
          precioVenta: 150,
          temporada: 'Verano',
          stockActual: 50,
          stockMinimo: 10,
          stockRecomendado: 60,
          stockSeguridad: 5,
          fechaUltimaImportacion: '2023-01-01',
          fechaUltimaExportacion: '2023-02-01',
          margenGanancia: 50,
          tiempoReposicion: 7,
          demandaPromedio: 5,
          locationNombre: 'Oficina Central',
          locationTipo: 'Oficina',
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange: Mock a database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      await getInventory(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener el inventario' });
    });

    it('should return an empty array if no inventory is found', async () => {
      // Arrange: Mock an empty database response
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getInventory(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});