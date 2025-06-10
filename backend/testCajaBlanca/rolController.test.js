// testCajaBlanca/rolController.test.js
const controller = require('../controllers/rolController');
const { connection } = require('../config/db');

jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn(),
    prepare: jest.fn()
  }
}));

describe('rolController', () => {

  describe('getRoles', () => {
    it('debe retornar 200 y un arreglo de roles', (done) => {
      const mockData = [{ Rol_ID: 1, Nombre: 'Admin' }];
      
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockData);
      });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(res.status).not.toHaveBeenCalled(); // status 200 implícito
          expect(data).toEqual(mockData);
          done();
        })
      };

      controller.getRoles(req, res);
    });

    it('debe retornar 500 si hay un error de conexión', (done) => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('DB error'), null);
      });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(res.status).toHaveBeenCalledWith(500);
          expect(data).toEqual({ error: 'DB error' });
          done();
        })
      };

      controller.getRoles(req, res);
    });
  });

  describe('createRol', () => {
    it('debe retornar 201 si se crea correctamente', (done) => {
      const statement = {
        exec: jest.fn((params, callback) => callback(null))
      };
      connection.prepare.mockImplementation((query, callback) => callback(null, statement));

      const req = { body: { Nombre: 'Proveedor' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(res.status).toHaveBeenCalledWith(201);
          expect(data).toEqual({ message: 'Rol creado' });
          done();
        })
      };

      controller.createRol(req, res);
    });

    it('debe retornar 500 si falla el prepare', (done) => {
      connection.prepare.mockImplementation((query, callback) => {
        callback(new Error('Error prepare'));
      });

      const req = { body: { Nombre: 'Supervisor' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(res.status).toHaveBeenCalledWith(500);
          expect(data).toEqual({ error: 'Error prepare' });
          done();
        })
      };

      controller.createRol(req, res);
    });

    it('debe retornar 500 si falla exec', (done) => {
      const statement = {
        exec: jest.fn((params, callback) => callback(new Error('Error exec')))
      };
      connection.prepare.mockImplementation((query, callback) => callback(null, statement));

      const req = { body: { Nombre: 'Cliente' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((data) => {
          expect(res.status).toHaveBeenCalledWith(500);
          expect(data).toEqual({ error: 'Error exec' });
          done();
        })
      };

      controller.createRol(req, res);
    });
  });

});
