


const { logoutUser } = require('../controllers/userController');
const { connection } = require("../config/db");


// Import necessary modules and the function to test
// Mock the response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

describe('logoutUser() logoutUser method', () => {
  let res;

  beforeEach(() => {
    // Initialize a new mock response object before each test
    res = mockResponse();
  });

  describe('Happy Paths', () => {
    it('should clear cookies and return a success message', async () => {
      // Test that the function clears cookies and returns a success message
      await logoutUser({}, res);

      expect(res.clearCookie).toHaveBeenCalledWith("Auth", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
      });
      expect(res.clearCookie).toHaveBeenCalledWith("Auth");
      expect(res.clearCookie).toHaveBeenCalledWith("UserData", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
      });
      expect(res.clearCookie).toHaveBeenCalledWith("UserData");
      expect(res.set).toHaveBeenCalledWith({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Sesión cerrada correctamente",
        success: true
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors gracefully', async () => {
      // Mock an error scenario
      const error = new Error('Test error');
      res.clearCookie.mockImplementationOnce(() => {
        throw error;
      });

      // Test that the function handles errors gracefully
      await logoutUser({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error cerrando sesión" });
    });
  });
});