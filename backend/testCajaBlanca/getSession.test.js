


const { getSession } = require('../controllers/userController');
const { connection } = require("../config/db");
const jwt = require("jsonwebtoken");


// Import necessary modules and dependencies
// Mock the jwt and connection modules
jest.mock("jsonwebtoken");
jest.mock("../config/db");

describe('getSession() getSession method', () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = {
      cookies: {
        Auth: 'validToken'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  describe('Happy paths', () => {
    it('should return user session data when token is valid and OTP is verified', async () => {
      // Mock jwt.verify to return a valid decoded token
      jwt.verify.mockReturnValue({
        id: 1,
        nombre: 'John Doe',
        rol: 'admin',
        correo: 'john.doe@example.com',
        username: 'johndoe',
        locationId: 123
      });

      // Mock database response for OTP verification
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ OTP_VERIFIED: true, OTP_VERIFIED_AT: new Date() }]);
      });

      await getSession(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'validToken',
        otpVerified: true,
        otpExpired: false,
        usuario: {
          id: 1,
          nombre: 'John Doe',
          rol: 'admin',
          correo: 'john.doe@example.com',
          username: 'johndoe',
          locationId: 123,
          LOCATION_ID: 123
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should return 401 if no token is provided', async () => {
      // Test when no token is present in cookies
      req.cookies.Auth = null;

      await getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should return 401 and clear cookie if token is invalid', async () => {
      // Mock jwt.verify to throw an error for invalid token
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await getSession(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('Auth', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should return server error if database query fails', async () => {
      // Mock jwt.verify to return a valid decoded token
      jwt.verify.mockReturnValue({ id: 1 });

      // Mock database error
      connection.exec.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });

    it('should handle OTP not verified scenario', async () => {
      // Mock jwt.verify to return a valid decoded token
      jwt.verify.mockReturnValue({ id: 1 });

      // Mock database response for OTP not verified
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ OTP_VERIFIED: false, OTP_VERIFIED_AT: null }]);
      });

      await getSession(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'validToken',
        otpVerified: false,
        otpExpired: true,
        usuario: {
          id: 1,
          nombre: undefined,
          rol: undefined,
          correo: undefined,
          username: undefined,
          locationId: undefined,
          LOCATION_ID: undefined
        }
      });
    });

    it('should handle OTP expired scenario', async () => {
      // Mock jwt.verify to return a valid decoded token
      jwt.verify.mockReturnValue({ id: 1 });

      // Mock database response for OTP verified but expired
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2); // 2 days ago
      connection.exec.mockImplementation((query, params, callback) => {
        callback(null, [{ OTP_VERIFIED: true, OTP_VERIFIED_AT: pastDate }]);
      });

      await getSession(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'validToken',
        otpVerified: true,
        otpExpired: true,
        usuario: {
          id: 1,
          nombre: undefined,
          rol: undefined,
          correo: undefined,
          username: undefined,
          locationId: undefined,
          LOCATION_ID: undefined
        }
      });
    });
  });
});