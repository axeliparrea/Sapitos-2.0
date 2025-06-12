


const { getUserById } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the database connection
jest.mock("../config/db", () => ({
  connection: {
    execute: jest.fn(),
  },
}));

describe('getUserById() getUserById method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return user data when a valid user ID is provided', async () => {
      // Arrange: Set up the mock database response
      const mockUserId = 1;
      const mockUserData = {
        USUARIO_ID: mockUserId,
        NOMBRE: 'John Doe',
        ROLNOMBRE: 'Admin',
      };
      connection.execute.mockImplementation((query, params, callback) => {
        callback(null, [mockUserData]);
      });

      // Act: Call the function with a valid user ID
      const result = await getUserById(mockUserId);

      // Assert: Verify the function returns the expected user data
      expect(result).toEqual(mockUserData);
      expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [mockUserId], expect.any(Function));
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return null when no user is found for the given ID', async () => {
      // Arrange: Set up the mock database response for no user found
      const mockUserId = 999;
      connection.execute.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      // Act: Call the function with a user ID that does not exist
      const result = await getUserById(mockUserId);

      // Assert: Verify the function returns null
      expect(result).toBeNull();
      expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [mockUserId], expect.any(Function));
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Set up the mock database to throw an error
      const mockUserId = 1;
      const mockError = new Error('Database error');
      connection.execute.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      // Act & Assert: Call the function and expect it to throw the error
      await expect(getUserById(mockUserId)).rejects.toThrow('Database error');
      expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [mockUserId], expect.any(Function));
    });
  });
});