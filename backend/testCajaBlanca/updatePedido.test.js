


const { updatePedido } = require('../controllers/pedidosController');
const { connection } = require("../config/db");
const { generarNotificacion } = require("../controllers/alertaController");


// Import necessary modules and functions
// Mock the generarNotificacion function
jest.mock("../controllers/alertaController", () => {
  const originalModule = jest.requireActual("../controllers/alertaController");
  return {
    __esModule: true,
    ...originalModule,
    generarNotificacion: jest.fn(),
  };
});

// Mock the connection.exec function
jest.mock("../config/db", () => ({
  exec: jest.fn(),
}));

describe('updatePedido() updatePedido method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });


  describe('Edge cases', () => {
    it('should return 400 if ID is invalid', async () => {
      // Arrange
      req.params.id = 'invalid';

      // Act
      await updatePedido(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID de pedido inválido' });
    });

    it('should return 400 if no data is provided for update', async () => {
      // Act
      await updatePedido(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'No hay datos para actualizar' });
    });

    it('should return 400 if estado is provided in the request body', async () => {
      // Arrange
      req.body.estado = 'Aprobado';

      // Act
      await updatePedido(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Use las rutas específicas para cambiar el estado (/aprobar, /entregar)',
      });
    });

  });
});