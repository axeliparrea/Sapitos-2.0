


const { getPedido } = require('../controllers/pedidosController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

describe('getPedido() getPedido method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy paths', () => {
    it('should return a list of formatted orders when the query is successful', async () => {
      // Mock the database response
      const mockResult = [
        {
          ID: 1,
          CORREO_CREADOR: 'user@example.com',
          CREADO_POR_NOMBRE: 'John Doe',
          USER_LOCATION_ID: 101,
          Organizacion: 'Org1',
          TipoOrden: 'Compra',
          FECHACREACION: '2023-10-01',
          FECHAACEPTACION: '2023-10-02',
          FECHAESTIMAPAGO: '2023-10-10',
          FECHAESTIMAENTREGA: '2023-10-15',
          FECHAENTREGA: '2023-10-16',
          ENTREGAATIEMPO: 1,
          ESTATUS: 'Completado',
          TOTAL: 100.0,
          METODOPAGO: 'Credit Card',
          DESCUENTOAPLICADO: 5.0,
          TIEMPOREPOSICION: 2,
          TIEMPOENTREGA: 3
        }
      ];

      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      await getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          creadaPor: 'user@example.com',
          creadoPorNombre: 'John Doe',
          locationId: 101,
          organizacion: 'Org1',
          tipoOrden: 'Compra',
          fechaCreacion: '2023-10-01',
          fechaAceptacion: '2023-10-02',
          fechaEstimaPago: '2023-10-10',
          fechaEstimaEntrega: '2023-10-15',
          fechaEntrega: '2023-10-16',
          entregaATiempo: 1,
          estatus: 'Completado',
          total: 100.0,
          metodoPago: 'Credit Card',
          descuentoAplicado: 5.0,
          tiempoReposicion: 2,
          tiempoEntrega: 3
        }
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle an empty result set gracefully', async () => {
      // Mock the database response with an empty array
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      await getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return a 500 error when the database query fails', async () => {
      // Mock the database response with an error
      const mockError = new Error('Database error');
      connection.exec.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      await getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener los pedidos',
        detalle: 'Database error'
      });
    });

    it('should return a 500 error when an unexpected error occurs', async () => {
      // Mock the database response to throw an error
      connection.exec.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await getPedido(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error del servidor'
      });
    });
  });
});