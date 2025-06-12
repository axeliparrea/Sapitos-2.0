


const { getOrganizationUsers } = require('../controllers/userController');
const { connection } = require("../config/db");
const jwt = require("jsonwebtoken");


// Import necessary modules and the function to test
// Mock the dependencies
jest.mock("jsonwebtoken");
jest.mock("../config/db");

describe('getOrganizationUsers() getOrganizationUsers method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy Paths', () => {
    it('should return organization users when a valid token is provided and user has a location', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 1, locationId: 10 };
      const locationResult = [{ ORGANIZACION: 'Org1' }];
      const orgUsers = [
        {
          USUARIO_ID: 2,
          CORREO: 'user2@example.com',
          NOMBRE: 'User Two',
          USERNAME: 'user2',
          ROL_ID: 1,
          ROLNOMBRE: 'Admin',
          RFC: 'RFC123',
          FECHAEMPIEZO: '2023-01-01',
          LOCATION_ID: 10,
          LOCATIONNOMBRE: 'Location1',
          ORGANIZACION: 'Org1',
        },
      ];

      req = { cookies: { Auth: token } };
      jwt.verify.mockReturnValue(decodedToken);
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, locationResult))
        .mockImplementationOnce((query, params, callback) => callback(null, orgUsers));

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 2,
          correo: 'user2@example.com',
          nombre: 'User Two',
          username: 'user2',
          rolId: 1,
          rol: 'Admin',
          rfc: 'RFC123',
          fechaEmpiezo: '2023-01-01',
          locationId: 10,
          locationNombre: 'Location1',
          organizacion: 'Org1',
          diasOrdenProm: null,
          valorOrdenProm: null,
        },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should return 401 if no token is provided', async () => {
      // Arrange
      req = { cookies: {} };

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should return 200 with an empty array if user has no location', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 1, locationId: null };

      req = { cookies: { Auth: token } };
      jwt.verify.mockReturnValue(decodedToken);

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if there is an error getting the location', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 1, locationId: 10 };

      req = { cookies: { Auth: token } };
      jwt.verify.mockReturnValue(decodedToken);
      connection.exec.mockImplementationOnce((query, params, callback) => callback(new Error('DB error')));

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });

    it('should return 200 with an empty array if location is not found', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 1, locationId: 10 };

      req = { cookies: { Auth: token } };
      jwt.verify.mockReturnValue(decodedToken);
      connection.exec.mockImplementationOnce((query, params, callback) => callback(null, []));

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if there is an error getting organization users', async () => {
      // Arrange
      const token = 'validToken';
      const decodedToken = { id: 1, locationId: 10 };
      const locationResult = [{ ORGANIZACION: 'Org1' }];

      req = { cookies: { Auth: token } };
      jwt.verify.mockReturnValue(decodedToken);
      connection.exec
        .mockImplementationOnce((query, params, callback) => callback(null, locationResult))
        .mockImplementationOnce((query, params, callback) => callback(new Error('DB error')));

      // Act
      await getOrganizationUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});