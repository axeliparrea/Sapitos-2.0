


const { getDetallePedidoPyme } = require('../controllers/pedidosPymesController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getDetallePedidoPyme() getDetallePedidoPyme method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return order details when a valid order ID is provided', async () => {
      // Arrange: Set up the mock database response
      const mockResult = [
        {
          nombre: 'Producto A',
          categoria: 'Categoria 1',
          cantidad: 2,
          precioUnitario: 100,
          subtotal: 200,
          stockDisponible: 50,
        },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getDetallePedidoPyme(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('Edge cases', () => {
    it('should return a 400 error if the order ID is invalid', async () => {
      // Arrange: Set up an invalid order ID
      req.params.id = 'invalid';

      // Act: Call the function
      await getDetallePedidoPyme(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID de pedido inválido' });
    });

    it('should return a 404 error if no details are found for the order', async () => {
      // Arrange: Set up the mock database response to return no results
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getDetallePedidoPyme(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No se encontraron detalles para este pedido' });
    });

    it('should return a 500 error if there is a database error', async () => {
      // Arrange: Set up the mock database response to return an error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      await getDetallePedidoPyme(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener detalles del pedido' });
    });
  });
});