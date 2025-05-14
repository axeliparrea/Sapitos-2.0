const request = require('supertest');
const express = require('express');
const inventoryRouter = require('../routes/inventory');
const { getInventory } = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

jest.mock('../controllers/inventoryController');
jest.mock('../middleware/auth', () => ({
  auth: () => (req, res, next) => next()  // Bypass auth
}));

const app = express();
app.use(express.json());
app.use('/inventory', inventoryRouter);

describe('GET /inventory', () => {
  it('debe retornar 200 con un listado de inventario', async () => {
    // Simula datos retornados por el controlador
    const mockData = [{ id: 1, nombre: 'Zapato', stockActual: 10 }];
    getInventory.mockImplementation((req, res) => res.status(200).json(mockData));

    const res = await request(app).get('/inventory');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });
});
