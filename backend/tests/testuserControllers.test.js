const { getUsers } = require('../controllers/userController');

jest.mock('../config/db', () => ({
  connection: {
    exec: jest.fn()
  }
}));

const { connection } = require('../config/db');

describe('getUsers', () => {
  it('debe retornar 200 y un array de usuarios formateado', async () => {
    const mockUsuarios = [
      {
        CORREO: 'test@example.com',
        NOMBRE: 'Test User',
        ORGANIZACION: 'Empresa XYZ',
        CONTRASENA: 'hashedpwd',
        ROL: 'admin',
        DIASORDENPROM: 10,
        VALORORDENPROM: 2000
      }
    ];

    connection.exec.mockImplementation((query, params, cb) => {
      cb(null, mockUsuarios);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 'test@example.com',
        correo: 'test@example.com',
        nombre: 'Test User',
        organizacion: 'Empresa XYZ',
        rol: 'admin',
        diasOrdenProm: 10,
        valorOrdenProm: 2000
      }
    ]);
  });

  it('debe retornar 500 si connection.exec retorna error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    connection.exec.mockImplementation((query, params, cb) => {
      cb(new Error('DB error'), null);
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los usuarios' });

    console.error.mockRestore();
  });
});
