jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

const { registerUser, loginUser, getSession, getUsers } = require("../controllers/userController");
const dbMock = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  res.set = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  return res;
};

describe("userController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("debería registrar un usuario correctamente", async () => {
      const req = {
        body: {
          correo: "correo@test.com",
          nombre: "Usuario Test",
          contrasena: "1234",
          rol: "Cliente",
          username: "user123",
          rfc: "XAXX010101000",
          location_id: 1
        }
      };

      const res = mockRes();

      bcrypt.hash.mockResolvedValue("hashed123");
      dbMock.connection.exec.mockImplementation((query, params, cb) => {
        if (query.includes("SELECT Rol_ID")) {
          cb(null, [{ ROL_ID: 2 }]);
        } else {
          cb(null);
        }
      });

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario registrado exitosamente" });
    });

    it("debería devolver error si faltan campos", async () => {
      const req = { body: { nombre: "Faltante" } };
      const res = mockRes();

      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("loginUser", () => {
    it("debería autenticar exitosamente con datos válidos", async () => {
      const hashedPassword = await bcrypt.hash("1234", 10);

      const req = {
        body: { correo: "correo@test.com", contrasena: "1234" },
        cookies: {}
      };
      const res = mockRes();

      dbMock.connection.exec
        .mockImplementationOnce((query, params, cb) => {
          cb(null, [{
            USUARIO_ID: 1,
            NOMBRE: "Usuario Test",
            CORREO: "correo@test.com",
            USERNAME: "user123",
            CLAVE: hashedPassword,
            ROLNOMBRE: "Admin",
            LOCATION_ID: 5
          }]);
        })
        .mockImplementationOnce((query, params, cb) => {
          cb(null, [{ ORGANIZACION: "Empresa X" }]);
        })
        .mockImplementationOnce((query, params, cb) => {
          cb(null, []); // otros usuarios
        });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockedToken");

      await loginUser(req, res);

      expect(res.status).not.toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensaje: "Login exitoso",
        token: "mockedToken",
        requiresOtp: expect.any(Boolean),
        usuario: expect.objectContaining({
          id: 1,
          nombre: "Usuario Test",
          correo: "correo@test.com",
          rol: "Admin",
          username: "user123",
          locationId: 5
        }),
        organizationUsers: expect.any(Array)
      }));
    });

    it("debería devolver error si faltan campos", async () => {
      const req = { body: { correo: "" } };
      const res = mockRes();

      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getSession", () => {
    it("debería devolver sesión si el token es válido", async () => {
      const token = "mock.token.value";
      const decoded = {
        id: 1,
        nombre: "Test",
        correo: "correo@test.com",
        rol: "Admin",
        username: "testuser",
        locationId: undefined
      };

      const req = {
        cookies: { Auth: token }
      };

      const res = mockRes();

      jwt.verify.mockReturnValue(decoded);

      dbMock.connection.exec.mockImplementation((query, params, cb) => {
        cb(null, [{ OTP_VERIFIED: 0, OTP_VERIFIED_AT: null }]);
      });

      await getSession(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token,
        otpVerified: expect.any(Boolean),
        otpExpired: expect.any(Boolean),
        usuario: expect.objectContaining({
          id: 1,
          nombre: "Test",
          correo: "correo@test.com",
          rol: "Admin",
          username: "testuser",
          locationId: undefined,
          LOCATION_ID: undefined
        })
      }));
    });

    it("debería devolver 401 si no hay token", async () => {
      const req = { cookies: {} };
      const res = mockRes();

      await getSession(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("debería devolver 401 si el token es inválido", async () => {
      jwt.verify.mockImplementation(() => { throw new Error("Invalid"); });

      const req = { cookies: { Auth: "invalid" } };
      const res = mockRes();

      await getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("getUsers", () => {
    it("debería retornar lista de usuarios", async () => {
      const req = {};
      const res = mockRes();

      const mockUsuarios = [
        {
          USUARIO_ID: 1,
          CORREO: "uno@test.com",
          NOMBRE: "Uno",
          USERNAME: "uno",
          RFC: "XAXX010101000",
          FECHAEMPIEZO: "2023-01-01",
          LOCATION_ID: 1,
          ROLNombre: "Admin"
        }
      ];

      dbMock.connection.exec.mockImplementation((q, p, cb) => cb(null, mockUsuarios));

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          correo: "uno@test.com"
        })
      ]));
    });
  });
});
