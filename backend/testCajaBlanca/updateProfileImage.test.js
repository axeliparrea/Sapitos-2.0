


const { updateProfileImage } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('updateProfileImage() updateProfileImage method', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      body: {
        correo: 'test@example.com',
        imageData: 'someImageData',
        contentType: 'image/jpeg',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should update the profile image successfully', () => {
      // Arrange: Set up the mock to simulate a successful database update
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      // Act: Call the function
      updateProfileImage(req, res);

      // Assert: Check that the response is correct
      expect(connection.exec).toHaveBeenCalledWith(
        'UPDATE USUARIO2 SET IMAGEN = ? WHERE CORREO = ?',
        [Buffer.from(req.body.imageData), req.body.correo],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Imagen actualizada correctamente' });
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if correo is missing', () => {
      // Arrange: Remove correo from the request body
      delete req.body.correo;

      // Act: Call the function
      updateProfileImage(req, res);

      // Assert: Check that the response is a 400 error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos' });
    });

    it('should return 400 if imageData is missing', () => {
      // Arrange: Remove imageData from the request body
      delete req.body.imageData;

      // Act: Call the function
      updateProfileImage(req, res);

      // Assert: Check that the response is a 400 error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos' });
    });

    it('should return 500 if there is a database error', () => {
      // Arrange: Set up the mock to simulate a database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Act: Call the function
      updateProfileImage(req, res);

      // Assert: Check that the response is a 500 error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });
  });
});