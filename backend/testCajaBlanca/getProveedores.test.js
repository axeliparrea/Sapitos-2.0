


const { getProveedores } = require('../controllers/pedidosController');
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

// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getProveedores() getProveedores method', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Happy path test
  it('should return a list of formatted providers when the query is successful', async () => {
    // Arrange: Mock the database response
    const mockResult = [
      { NOMBRE: 'Proveedor A', TOTAL_PRODUCTOS: 10 },
      { NOMBRE: 'Proveedor B', TOTAL_PRODUCTOS: 5 },
    ];
    connection.exec.mockImplementation((query, params, callback) => {
      callback(null, mockResult);
    });

    // Act: Call the getProveedores function
    await getProveedores(req, res);

    // Assert: Check that the response is correct
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { nombre: 'Proveedor A', totalProductos: 10 },
      { nombre: 'Proveedor B', totalProductos: 5 },
    ]);
  });

  // Edge case test
  it('should handle an empty result set gracefully', async () => {
    // Arrange: Mock the database response with an empty array
    connection.exec.mockImplementation((query, params, callback) => {
      callback(null, []);
    });

    // Act: Call the getProveedores function
    await getProveedores(req, res);

    // Assert: Check that the response is an empty array
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  // Error handling test
  it('should return a 500 error if the database query fails', async () => {
    // Arrange: Mock the database to return an error
    const mockError = new Error('Database error');
    connection.exec.mockImplementation((query, params, callback) => {
      callback(mockError, null);
    });

    // Act: Call the getProveedores function
    await getProveedores(req, res);

    // Assert: Check that the response is a 500 error with the correct message
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error al obtener proveedores',
      detalle: 'Database error',
    });
  });
});