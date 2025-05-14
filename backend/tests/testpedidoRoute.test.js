const request = require('supertest');
const express = require('express');
const pedidosRouter = require('../routes/pedido');
const { getPedido } = require('../controllers/pedidosController');

jest.mock('../controllers/pedidosController');
jest.mock('../middleware/auth', () => ({
  auth: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/pedido', pedidosRouter);

describe('GET /pedido', () => {
  it('debe retornar 200 con una lista de pedidos', async () => {
    const mockPedidos = [
      {
        id: 1,
        creadaPor: 'Luis',
        fechaCreacion: '2024-01-01',
        estatus: 'Nuevo',
        total: 2500
      }
    ];

    getPedido.mockImplementation((req, res) => res.status(200).json(mockPedidos));

    const res = await request(app).get('/pedido');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockPedidos);
  });
});
