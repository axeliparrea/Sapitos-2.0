


const { rechazarPedidoPyme } = require('../controllers/pedidosPymesController');
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

describe('rechazarPedidoPyme() rechazarPedidoPyme method', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    connection.exec.mockClear();
    generarNotificacion.mockClear();
  });

  describe('Happy paths', () => {
    it('should reject a pending PYME order successfully', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT')) {
          callback(null, [{ ESTADO: 'Pendiente', TIPOORDEN: 'PYME', ORGANIZACION: 'TestOrg' }]);
        } else if (query.includes('UPDATE')) {
          callback(null);
        }
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(connection.exec).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Pedido PYME rechazado exitosamente' });
      expect(generarNotificacion).toHaveBeenCalledWith(
        'Pedido PYME #1 de TestOrg ha sido rechazado',
        'Pedido PYME Rechazado',
        'error',
        1,
        '1'
      );
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if ID is invalid', async () => {
      // Arrange
      req.params.id = 'invalid';

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID de pedido inválido' });
    });

    it('should return 404 if order is not found', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Pedido no encontrado' });
    });

    it('should return 400 if order is not of type PYME', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ ESTADO: 'Pendiente', TIPOORDEN: 'OTHER' }]);
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Este pedido no es de tipo PYME' });
    });

    it('should return 400 if order is not in pending state', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ ESTADO: 'En Reparto', TIPOORDEN: 'PYME' }]);
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Solo se pueden rechazar pedidos en estado Pendiente' });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al verificar el pedido' });
    });

    it('should handle update errors gracefully', async () => {
      // Arrange
      connection.exec.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT')) {
          callback(null, [{ ESTADO: 'Pendiente', TIPOORDEN: 'PYME' }]);
        } else if (query.includes('UPDATE')) {
          callback(new Error('Update error'));
        }
      });

      // Act
      await rechazarPedidoPyme(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al rechazar el pedido' });
    });
  });
});