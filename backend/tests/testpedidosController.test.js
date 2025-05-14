const { getPedido } = require('../controllers/pedidosController');

jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

const { connection } = require('../config/db');

describe('getPedido', () => {
  it('debe retornar 200 y un array de pedidos formateado', async () => {
    const mockPedidos = [
      {
        ID: 1,
        CREADA_POR: 'María',
        FECHACREACION: '2024-01-01',
        FECHAESTIMAACEPTACION: null,
        FECHAACEPTACION: null,
        FECHAESTIMAPAGO: null,
        FECHAPAGO: null,
        COMPROBANTEPAGO: null,
        FECHAESTIMAENTREGA: null,
        FECHAENTREGA: null,
        ENTREGAATIEMPO: null,
        CALIDAD: null,
        ESTATUS: 'Nuevo',
        TOTAL: 3000,
        METODOPAGO: 'Tarjeta',
        DESCUENTOAPLICADO: 5,
        TIEMPOREPOSICION: null,
        TIEMPOENTREGA: null
      }
    ];

    connection.exec.mockImplementation((query, params, cb) => {
      cb(null, mockPedidos);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        creadaPor: 'María',
        estatus: 'Nuevo',
        total: 3000,
        metodoPago: 'Tarjeta'
      })
    ]);
  });

  it('debe retornar 500 si ocurre un error de DB', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // silencia consola

    connection.exec.mockImplementation((query, params, cb) => {
      cb(new Error('DB error'), null);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getPedido(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los pedidos' });

    console.error.mockRestore(); // restaura consola
  });
});
