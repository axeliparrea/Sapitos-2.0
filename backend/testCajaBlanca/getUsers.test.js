


const { getUsers } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getUsers() getUsers method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should return a list of users when the database query is successful', async () => {
      // Arrange: Mock the database response
      const mockUsers = [
        {
          USUARIO_ID: 1,
          NOMBRE: 'John Doe',
          CORREO: 'john@example.com',
          USERNAME: 'johndoe',
          ROL_ID: 2,
          RFC: 'RFC123',
          FECHAEMPIEZO: '2023-01-01',
          LOCATION_ID: 10,
          ROLNombre: 'Admin',
        },
      ];
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, mockUsers);
      });

      // Act: Call the getUsers function
      await getUsers(req, res);

      // Assert: Check that the response is correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          correo: 'john@example.com',
          nombre: 'John Doe',
          username: 'johndoe',
          rolId: 2,
          rol: 'Admin',
          rfc: 'RFC123',
          fechaEmpiezo: '2023-01-01',
          locationId: 10,
          diasOrdenProm: null,
          valorOrdenProm: null,
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange: Mock a database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the getUsers function
      await getUsers(req, res);

      // Assert: Check that the error is handled
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener los usuarios' });
    });

    it('should return an empty list if no users are found', async () => {
      // Arrange: Mock an empty database response
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the getUsers function
      await getUsers(req, res);

      // Assert: Check that an empty list is returned
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});