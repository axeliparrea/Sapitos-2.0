const request = require('supertest');
const express = require('express');
const app = express();
const pedidoController = require('../controllers/pedidosController');
const db = require('../config/db');

jest.mock('../config/db', () => {
  const exec = jest.fn();
  const connection = { exec };
  return { connection };
});

app.use(express.json());
app.get('/pedidos', pedidoController.getPedido);
app.post('/pedidos', pedidoController.insertPedido);
app.put('/pedidos/:id', pedidoController.updatePedido);
app.put('/pedidos/aprobar/:id', pedidoController.aprobarPedido);
app.put('/pedidos/entregar/:id', pedidoController.entregarPedido);

describe('pedidoController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPedido', () => {
    it('debe retornar lista de pedidos con status 200', async () => {
      db.connection.exec.mockImplementation((query, _, cb) => {
        cb(null, [{
          ID: 1, CORREO_CREADOR: 'admin@test.com', CREADO_POR_NOMBRE: 'Admin',
          Organizacion: 'TestOrg', TipoOrden: 'Compra', FECHACREACION: '2024-01-01',
          ESTATUS: 'Pendiente', TOTAL: 100, METODOPAGO: 'Efectivo'
        }]);
      });

      const res = await request(app).get('/pedidos');
      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('id', 1);
    });

    it('debe retornar 500 si hay error de conexión', async () => {
      db.connection.exec.mockImplementation((_, __, cb) => cb(new Error('fail'), null));
      const res = await request(app).get('/pedidos');
      expect(res.status).toBe(500);
    });
  });

  describe('insertPedido', () => {
    it('debe insertar un pedido correctamente', async () => {
      db.connection.exec
        .mockImplementationOnce((_, __, cb) => cb(null)) // insert orden
        .mockImplementationOnce((_, __, cb) => cb(null, [{ ORDENID: 123 }])) // get ordenId
        .mockImplementationOnce((_, __, cb) => cb(null, [{ INVENTARIO_ID: 10 }])) // buscar inventario
        .mockImplementationOnce((_, __, cb) => cb(null)); // insert producto

      const pedido = {
        creadoPorId: 1,
        organizacion: 'TestOrg',
        productos: [{ articuloId: 101, cantidad: 2, precio: 50 }],
        total: 100
      };

      const res = await request(app).post('/pedidos').send(pedido);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ordenId');
    });

    it('debe retornar 400 si faltan datos', async () => {
      const res = await request(app).post('/pedidos').send({ creadoPorId: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('updatePedido', () => {
    it('actualiza pedido exitosamente', async () => {
      db.connection.exec.mockResolvedValueOnce({});
      const res = await request(app).put('/pedidos/1').send({ total: 200 });
      expect(res.status).toBe(200);
    });

    it('retorna 400 si no hay datos a actualizar', async () => {
      const res = await request(app).put('/pedidos/1').send({});
      expect(res.status).toBe(400);
    });

    it('retorna 500 si ocurre un error', async () => {
      db.connection.exec.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).put('/pedidos/1').send({ total: 300 });
      expect(res.status).toBe(500);
    });
  });

  describe('aprobarPedido', () => {
    it('aprueba pedido correctamente si está Pendiente', async () => {
      db.connection.exec
        .mockResolvedValueOnce([{ Estado: 'Pendiente' }]) // check estado
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // UPDATE
        .mockResolvedValueOnce(); // COMMIT

      const res = await request(app).put('/pedidos/aprobar/1');
      expect(res.status).toBe(200);
    });

    it('retorna 400 si el pedido no está Pendiente', async () => {
      db.connection.exec.mockResolvedValueOnce([{ Estado: 'Aprobado' }]);
      const res = await request(app).put('/pedidos/aprobar/1');
      expect(res.status).toBe(400);
    });

    it('retorna 404 si el pedido no existe', async () => {
      db.connection.exec.mockResolvedValueOnce([]);
      const res = await request(app).put('/pedidos/aprobar/999');
      expect(res.status).toBe(404);
    });
  });

  describe('entregarPedido', () => {
    it('marca como entregado si está Aprobado', async () => {
      db.connection.exec
        .mockResolvedValueOnce([{ Estado: 'Aprobado' }]) // check estado
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce([{ Inventario_ID: 1, Cantidad: 2, Location_ID: 1, Articulo_ID: 1 }]) // productos
        .mockResolvedValueOnce() // UPDATE stock
        .mockResolvedValueOnce() // UPDATE orden
        .mockResolvedValueOnce(); // COMMIT

      const res = await request(app).put('/pedidos/entregar/1');
      expect(res.status).toBe(200);
    });

    it('retorna 400 si no está aprobado', async () => {
      db.connection.exec.mockResolvedValueOnce([{ Estado: 'Pendiente' }]);
      const res = await request(app).put('/pedidos/entregar/1');
      expect(res.status).toBe(400);
    });

    it('retorna 404 si no existe', async () => {
      db.connection.exec.mockResolvedValueOnce([]);
      const res = await request(app).put('/pedidos/entregar/999');
      expect(res.status).toBe(404);
    });
  });
});
