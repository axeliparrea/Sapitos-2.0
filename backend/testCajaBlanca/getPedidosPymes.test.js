


const { getPedidosPymes } = require('../controllers/pedidosPymesController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getPedidosPymes() getPedidosPymes method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return a list of pedidos PYMES when the query is successful', async () => {
      // Arrange: Mock the database response
      const mockResult = [
        {
          id: 1,
          fecha: '2023-10-01',
          solicitadoPor: 'John Doe',
          correoSolicitante: 'john.doe@example.com',
          total: 100.0,
          estado: 'Pendiente',
          fechaEstimada: '2023-10-08',
          tipoOrden: 'PYME',
          descuento: 10,
          organizacion: 'Org1',
        },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      // Act: Call the function
      await getPedidosPymes(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('Edge cases', () => {
    it('should return an empty array if no pedidos PYMES are found', async () => {
      // Arrange: Mock the database response with an empty result
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getPedidosPymes(req, res);

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
      await getPedidosPymes(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener pedidos' });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange: Mock the database to throw an unexpected error
      connection.exec.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act: Call the function
      await getPedidosPymes(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});