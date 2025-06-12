


const { getUserByEmail } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getUserByEmail() getUserByEmail method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = {
      params: {
        correo: 'test@example.com',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Clear all instances and calls to constructor and all methods:
    connection.exec.mockClear();
  });

  describe('Happy paths', () => {
    it('should return user data when a user is found', async () => {
      // Arrange: Mock the database response
      const mockUser = [{
        USUARIO_ID: 1,
        CORREO: 'test@example.com',
        NOMBRE: 'Test User',
        USERNAME: 'testuser',
        RFC: 'RFC123',
        FECHAEMPIEZO: '2023-01-01',
        LOCATION_ID: 10,
        ROLNombre: 'Admin',
      }];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockUser);
      });

      // Act: Call the function
      await getUserByEmail(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        correo: 'test@example.com',
        nombre: 'Test User',
        username: 'testuser',
        organizacion: 'DEFAULT',
        rol: 'Admin',
        rfc: 'RFC123',
        fechaEmpiezo: '2023-01-01',
        locationId: 10,
        diasOrdenProm: null,
        valorOrdenProm: null,
      });
    });
  });

  describe('Edge cases', () => {
    it('should return 404 when no user is found', async () => {
      // Arrange: Mock the database response to return no user
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function
      await getUserByEmail(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('should return 500 when there is a database error', async () => {
      // Arrange: Mock the database response to simulate an error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      await getUserByEmail(req, res);

      // Assert: Check the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});