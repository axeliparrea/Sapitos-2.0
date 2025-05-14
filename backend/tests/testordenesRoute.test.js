const request = require('supertest');
const express = require('express');
const ordenesRouter = require('../routes/ordenes');
const { getOrden } = require('../controllers/ordenesController');

jest.mock('../controllers/ordenesController');
jest.mock('../middleware/auth', () => ({
  auth: () => (req, res, next) => next()  // se omite la autenticación
}));

const app = express();
app.use(express.json());
app.use('/ordenes', ordenesRouter);

describe('GET /ordenes', () => {
  it('debe retornar 200 con un array de órdenes', async () => {
    const mockOrdenes = [
      {
        id: 1,
        creada_por: 'Juan',
        tipoOrden: 'Compra',
        organizacion: 'Empresa X',
        estatus: 'Pendiente',
        total: 3000
      }
    ];

    getOrden.mockImplementation((req, res) => res.status(200).json(mockOrdenes));

    const res = await request(app).get('/ordenes');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockOrdenes);
  });
});
