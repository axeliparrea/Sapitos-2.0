


const { getProfileImage } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('getProfileImage() getProfileImage method', () => {
  let req, res;

  beforeEach(() => {
    // Set up mock request and response objects
    req = {
      params: {
        correo: 'test@example.com',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    };

    // Clear mock calls before each test
    connection.exec.mockClear();
    res.status.mockClear();
    res.json.mockClear();
    res.set.mockClear();
    res.send.mockClear();
  });

  // Happy path tests
  describe('Happy Paths', () => {
    it('should return the profile image when it exists', () => {
      // Mock database response with image data
      const mockImageData = Buffer.from('mockImageData');
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ IMAGEN: mockImageData }]);
      });

      // Call the function
      getProfileImage(req, res);

      // Assert the response
      expect(connection.exec).toHaveBeenCalledWith(
        'SELECT IMAGEN FROM USUARIO2 WHERE CORREO = ?',
        [req.params.correo],
        expect.any(Function)
      );
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Length': mockImageData.length,
        'Cache-Control': 'public, max-age=31536000',
      });
      expect(res.send).toHaveBeenCalledWith(mockImageData);
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should return 404 if the user is not found', () => {
      // Mock database response with no results
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Call the function
      getProfileImage(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('should return 404 if the image is not found', () => {
      // Mock database response with null image data
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ IMAGEN: null }]);
      });

      // Call the function
      getProfileImage(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Imagen no encontrada' });
    });

    it('should handle database errors gracefully', () => {
      // Mock database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      // Call the function
      getProfileImage(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
    });

    it('should handle non-buffer image data gracefully', () => {
      // Mock database response with string image data
      const mockImageData = 'mockImageData';
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ IMAGEN: mockImageData }]);
      });

      // Call the function
      getProfileImage(req, res);

      // Assert the response
      const expectedBuffer = Buffer.from(mockImageData);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'image/jpeg',
        'Content-Length': expectedBuffer.length,
        'Cache-Control': 'public, max-age=31536000',
      });
      expect(res.send).toHaveBeenCalledWith(expectedBuffer);
    });
  });
});