


const { loginUser } = require('../controllers/userController');
const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Import necessary modules and dependencies
// Mock dependencies
jest.mock("../config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe('loginUser() loginUser method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        correo: 'test@example.com',
        contrasena: 'password123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should successfully log in a user with correct credentials', async () => {
      // Mock database response
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{
          USUARIO_ID: 1,
          NOMBRE: 'Test User',
          CLAVE: 'hashedPassword',
          ROLNOMBRE: 'User',
          CORREO: 'test@example.com',
          USERNAME: 'testuser',
          LOCATION_ID: 1,
        }]);
      });

      // Mock bcrypt and jwt
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fakeToken');

      await loginUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('Auth', 'fakeToken', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensaje: 'Login exitoso',
        token: 'fakeToken',
      }));
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if email or password is missing', async () => {
      req.body = {}; // No email or password

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Correo/Usuario y contraseña son requeridos' });
    });

    it('should return 404 if user is not found', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []); // No user found
      });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('should return 401 if password is incorrect', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{
          USUARIO_ID: 1,
          NOMBRE: 'Test User',
          CLAVE: 'hashedPassword',
          ROLNOMBRE: 'User',
          CORREO: 'test@example.com',
          USERNAME: 'testuser',
          LOCATION_ID: 1,
        }]);
      });

      bcrypt.compare.mockResolvedValue(false); // Incorrect password

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' });
    });

    it('should return 500 if there is a database error', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });

    it('should return 500 if there is an error comparing passwords', async () => {
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{
          USUARIO_ID: 1,
          NOMBRE: 'Test User',
          CLAVE: 'hashedPassword',
          ROLNOMBRE: 'User',
          CORREO: 'test@example.com',
          USERNAME: 'testuser',
          LOCATION_ID: 1,
        }]);
      });

      bcrypt.compare.mockRejectedValue(new Error('bcrypt error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});