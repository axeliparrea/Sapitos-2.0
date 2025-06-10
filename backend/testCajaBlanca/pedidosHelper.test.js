const pedidosHelper = require("../controllers/pediosHelper");
const { connection } = require("../config/db");

jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
    execSync: jest.fn(),
  },
}));

describe("pedidosHelper", () => {
  describe("getMetodosPago", () => {
    it("debe retornar métodos de pago correctamente", async () => {
      const mockResult = [{ ID: 1, NOMBRE: "Efectivo" }];
      connection.exec.mockImplementation((query, params, cb) => cb(null, mockResult));

      const req = {}, res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await pedidosHelper.getMetodosPago(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it("maneja errores correctamente", async () => {
      connection.exec.mockImplementation((q, p, cb) => cb(new Error("DB Error")));

      const req = {}, res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await pedidosHelper.getMetodosPago(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener métodos de pago" });

    });
  });

  describe("getRoles", () => {
    it("debe devolver roles", async () => {
      const roles = [{ id: 1, nombre: "Admin" }];
      connection.exec.mockImplementation((q, p, cb) => cb(null, roles));

      const req = {}, res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await pedidosHelper.getRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(roles);
    });
  });

  describe("insertLocation", () => {
    it("debe insertar ubicación correctamente", async () => {
      connection.exec.mockImplementation((q, p, cb) => cb(null, { ID: 99 }));

      const req = {
        body: {
          nombre: "Bodega Test",
          tipo: "Principal",
          latitud: 25.6,
          longitud: -100.3,
          direccion: "Av. Test #123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await pedidosHelper.insertLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Location creada exitosamente",
        nombre: "Bodega Test",
        tipo: "Principal"
        });


    });
  });
});
