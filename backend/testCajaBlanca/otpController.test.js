
const { generateOTPHandler, verifyOTPHandler } = require('../controllers/otpController');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');
const { getUserById } = require('../controllers/userController');
const { connection } = require('../config/db');
const { generateOTP, verifyOTP } = require('../utils/otp');

jest.mock('../utils/emailService');
jest.mock('../controllers/userController');
jest.mock('../utils/otp');
jest.mock('jsonwebtoken');
jest.mock('../config/db', () => ({
  connection: { exec: jest.fn() }
}));

describe('otpController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      cookies: { Auth: 'mock.token' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
  });

  describe('generateOTPHandler', () => {
    it('should generate OTP and send email successfully', async () => {
      process.env.AUTH_OTP = 'true';
      const mockOTP = { otp: '123456', secret: 'secret-key' };
      const decodedToken = { id: 1, correo: 'test@example.com', authTimestamp: Date.now() };

      jwt.decode.mockReturnValue(decodedToken);
      generateOTP.mockReturnValue(mockOTP);
      getUserById.mockResolvedValue({ NOMBRE: 'Test User' });
      sendOTPEmail.mockResolvedValue(true);

      await generateOTPHandler(req, res);

      expect(sendOTPEmail).toHaveBeenCalledWith('test@example.com', '123456', 'Test User');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        secret: 'secret-key'
      }));
    });

    it('should return 401 if no auth token', async () => {
      req.cookies.Auth = null;

      await generateOTPHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 if sending email fails', async () => {
      const mockOTP = { otp: '123456', secret: 'secret-key' };
      jwt.decode.mockReturnValue({ id: 1, correo: 'test@example.com' });
      generateOTP.mockReturnValue(mockOTP);
      sendOTPEmail.mockResolvedValue(false);

      await generateOTPHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('verifyOTPHandler', () => {
    it('should verify OTP and update token', async () => {
      req.body = { otp: '123456', secret: 'secret-key' };
      const decodedToken = {
        id: 1,
        correo: 'test@example.com',
        username: 'tester'
      };

      jwt.verify.mockReturnValue(decodedToken);
      verifyOTP.mockReturnValue(true);
      jwt.sign.mockReturnValue('new.token');
      connection.exec.mockImplementation((query, params, cb) => cb(null));

      await verifyOTPHandler(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        verified: true,
        token: 'new.token'
      }));
    });

    it('should return 400 if OTP is invalid', async () => {
      req.body = { otp: '000000', secret: 'wrong' };
      verifyOTP.mockReturnValue(false);

      await verifyOTPHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ verified: false, message: 'Invalid OTP' });
    });

    it('should return 401 if token verification fails', async () => {
      req.body = { otp: '123456', secret: 'secret-key' };
      verifyOTP.mockReturnValue(true);
      jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

      await verifyOTPHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
