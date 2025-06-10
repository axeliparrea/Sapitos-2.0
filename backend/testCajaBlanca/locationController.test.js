const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

// Mock de conexión
jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn(),
    prepare: jest.fn(),
  },
}));

const { connection } = require('../config/db');
const locationController = require('../controllers/locationController');

app.get('/locations', locationController.getLocations);
app.post('/locations', locationController.createLocation);
app.put('/locations/:id', locationController.updateLocation);
app.delete('/locations/:id', locationController.deleteLocation);

describe('Location Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /locations - debe retornar todas las ubicaciones', async () => {
    const mockData = [{ Location_ID: 1, Nombre: 'Zona A' }];
    connection.exec.mockImplementation((query, params, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/locations');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('POST /locations - debe crear una ubicación', async () => {
    const mockStatement = { exec: jest.fn((params, cb) => cb(null)) };
    connection.prepare.mockImplementation((query, callback) => {
      callback(null, mockStatement);
    });

    const nuevaUbicacion = {
      Nombre: 'Zona B',
      Tipo: 'Entrada',
      PosicionX: 10,
      PosicionY: 20,
      FechaCreado: '2025-06-09',
      Organizacion: 'Org1'
    };

    const res = await request(app).post('/locations').send(nuevaUbicacion);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Ubicación creada' });
  });

  test('PUT /locations/:id - debe actualizar una ubicación', async () => {
    const mockStatement = { exec: jest.fn((params, cb) => cb(null)) };
    connection.prepare.mockImplementation((query, callback) => {
      callback(null, mockStatement);
    });

    const res = await request(app)
      .put('/locations/1')
      .send({ Nombre: 'Zona C', Tipo: 'Salida', PosicionX: 15, PosicionY: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Ubicación actualizada' });
  });

  test('DELETE /locations/:id - debe eliminar una ubicación', async () => {
    const mockStatement = { exec: jest.fn((params, cb) => cb(null)) };
    connection.prepare.mockImplementation((query, callback) => {
      callback(null, mockStatement);
    });

    const res = await request(app).delete('/locations/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Ubicación eliminada' });
  });
});
