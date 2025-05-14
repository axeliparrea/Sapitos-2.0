const request = require('supertest');
const express = require('express');
const userRouter = require('../routes/users');
const { getUsers } = require('../controllers/userController');

jest.mock('../controllers/userController');
jest.mock('../middleware/auth', () => ({
  auth: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/users', userRouter);

describe('GET /users/getUsers', () => {
  it('debe retornar 200 con una lista de usuarios', async () => {
    const mockUsuarios = [
      {
        id: 'test@example.com',
        correo: 'test@example.com',
        nombre: 'Test User',
        organizacion: 'Empresa XYZ',
        rol: 'admin',
        diasOrdenProm: 10,
        valorOrdenProm: 2000
      }
    ];

    getUsers.mockImplementation((req, res) => res.status(200).json(mockUsuarios));

    const res = await request(app).get('/users/getUsers');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUsuarios);
  });
});
