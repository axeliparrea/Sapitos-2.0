


const { getProveedoresInventario } = require('../controllers/pedidosController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the generarNotificacion function
jest.mock("../controllers/alertaController", () => {
  const originalModule = jest.requireActual("../controllers/alertaController");
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
  };
});

// Mock the connection.exec function
jest.mock("../config/db", () => {
  return {
    connection: {
      exec: jest.fn(),
    },
  };
});

describe('getProveedoresInventario() getProveedoresInventario method', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return a list of formatted providers when the query is successful', async () => {
      // Arrange: Mock the database response
      const mockResult = [
        { NOMBRE: 'Proveedor A', TOTAL_PRODUCTOS: 10 },
        { NOMBRE: 'Proveedor B', TOTAL_PRODUCTOS: 5 },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getProveedoresInventario(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { nombre: 'Proveedor A', totalProductos: 10 },
        { nombre: 'Proveedor B', totalProductos: 5 },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle an empty result set gracefully', async () => {
      // Arrange: Mock the database response with an empty array
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getProveedoresInventario(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock the database to return an error
      const mockError = new Error('Database error');
      connection.exec.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      // Act: Call the function
      await getProveedoresInventario(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener proveedores',
        detalle: mockError.message,
      });
    });
  });
});