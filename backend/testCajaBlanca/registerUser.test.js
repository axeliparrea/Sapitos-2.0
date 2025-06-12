


const { registerUser } = require('../controllers/userController');
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");


// Import necessary modules and the function to test
// Mock dependencies
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe('registerUser() registerUser method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        correo: 'test@example.com',
        nombre: 'Test User',
        contrasena: 'password123',
        rol: 'admin',
        username: 'testuser',
        rfc: 'RFC123456',
        location_id: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    bcrypt.hash.mockResolvedValue('hashedPassword');
  });

  describe('Happy paths', () => {


    it('should register a user without a role when role is not provided', async () => {
      req.body.rol = null;

      connection.exec.mockImplementation((query, params, callback) => {
        if (query.includes('INSERT INTO Usuario2')) {
          callback(null);
        }
      });

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(connection.exec).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado exitosamente' });
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body.correo = null;

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos obligatorios' });
    });

    it('should handle database errors gracefully', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error en el servidor' });
    });

    it('should handle bcrypt errors gracefully', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error en el servidor' });
    });

  });
});