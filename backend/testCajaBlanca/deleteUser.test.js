


const { deleteUser } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
  },
}));

describe('deleteUser() deleteUser method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });


    

  describe('Edge cases', () => {
    it('should return a 400 error if no email is provided', async () => {
      // Arrange
      req.body.corro = '';

      // Act
      await deleteUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Necesitas un email' });
    });

  });
});