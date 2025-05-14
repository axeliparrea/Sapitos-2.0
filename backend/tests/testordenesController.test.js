const { getOrden } = require('../controllers/ordenesController');

// Simular la conexión a base de datos
jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

const { connection } = require('../config/db');

describe('getOrden', () => {
  it('debe retornar 200 y un array de órdenes formateado', async () => {
    const mockOrdenes = [
      {
        ID: 1,
        CREADA_POR: 'Juan',
        TIPOORDEN: 'Compra',
        ORGANIZACION: 'Empresa A',
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
        ESTATUS: 'Pendiente',
        TOTAL: 1500,
        METODOPAGO: 'Transferencia',
        DESCUENTOAPLICADO: 0,
        TIEMPOREPOSICION: null,
        TIEMPOENTREGA: null
      }
    ];

    connection.exec.mockImplementation((query, params, cb) => {
      cb(null, mockOrdenes);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        creada_por: 'Juan',
        tipoOrden: 'Compra',
        organizacion: 'Empresa A',
        estatus: 'Pendiente',
        total: 1500
      })
    ]);
  });

  it('debe retornar 500 si falla la consulta', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // silenciar error

    connection.exec.mockImplementation((query, params, cb) => {
      cb(new Error('DB error'), null);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener las órdenes' });

    console.error.mockRestore(); // restaurar
  });
});
