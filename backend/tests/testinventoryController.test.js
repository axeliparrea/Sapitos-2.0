const { getInventory } = require('../controllers/inventoryController');

// Simular la conexión a base de datos
jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

const { connection } = require('../config/db');

describe('getInventory', () => {
  it('debe retornar 200 y un array formateado', async () => {
    const mockProductos = [
      {
        ID: 1,
        PROVEEDOR: 'ABC',
        NOMBRE: 'Zapato 1',
        CATEGORIA: 'Casual',
        STOCKACTUAL: 10,
        STOCKMINIMO: 2,
        FECHAULTIMACOMPRA: '2024-01-01',
        FECHAULTIMAVENTA: '2024-04-01',
        PRECIOCOMPRA: 100,
        PRECIOVENTA: 200
      }
    ];

    connection.exec.mockImplementation((query, params, cb) => {
      cb(null, mockProductos);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getInventory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        proveedor: 'ABC',
        nombre: 'Zapato 1',
        categoria: 'Casual',
        stockActual: 10,
        stockMinimo: 2,
        fechaUltimaCompra: '2024-01-01',
        fechaUltimaVenta: '2024-04-01',
        precioCompra: 100,
        precioVenta: 200
      }
    ]);
  });

  it('debe retornar 500 si hay un error en la base de datos', async () => {
    connection.exec.mockImplementation((query, params, cb) => {
      cb(new Error('DB error'), null);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getInventory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener el inventario' });
  });
});
