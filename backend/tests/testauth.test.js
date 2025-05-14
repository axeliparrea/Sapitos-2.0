const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

jest.mock('jsonwebtoken');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('debe rechazar si no hay token', () => {
    auth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe rechazar si el token es inválido', () => {
    req.cookies.Auth = 'token_invalido';
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    auth()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe rechazar si el rol no tiene permiso', () => {
    req.cookies.Auth = 'token_valido';
    jwt.verify.mockReturnValue({ ROL: 'cliente' });

    auth(['admin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe permitir el acceso si el token es válido y el rol está permitido', () => {
    req.cookies.Auth = 'token_valido';
    jwt.verify.mockReturnValue({ ROL: 'admin' });

    auth(['admin'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ ROL: 'admin' });
  });

  it('debe permitir el acceso si no se especifican roles y el token es válido', () => {
    req.cookies.Auth = 'token_valido';
    jwt.verify.mockReturnValue({ ROL: 'cliente' });

    auth()(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
