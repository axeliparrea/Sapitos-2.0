jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn(),
    prepare: jest.fn()
  }
}));

const { getArticulos, createArticulo, updateArticulo, deleteArticulo } = require("../controllers/articuloController");
const db = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("articuloController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getArticulos", () => {
    it("debería devolver todos los artículos", async () => {
      const req = {};
      const res = mockRes();
      const mockRows = [{ Articulo_ID: 1, Nombre: "Camisa" }];

      db.connection.exec.mockImplementation((query, params, cb) => cb(null, mockRows));

      await getArticulos(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRows);
    });

    it("debería manejar errores de base de datos", async () => {
      const req = {};
      const res = mockRes();

      db.connection.exec.mockImplementation((query, params, cb) => cb(new Error("DB error")));

      await getArticulos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener los artículos" });
    });
  });

  describe("createArticulo", () => {
    it("debería crear un nuevo artículo", async () => {
      const req = {
        body: {
          Nombre: "Camisa",
          Categoria: "Ropa",
          PrecioProveedor: 100,
          PrecioVenta: 150,
          Temporada: "Verano"
        }
      };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(null)
        })
      );

      await createArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Artículo creado exitosamente" });
    });

    it("debería devolver 400 si faltan campos", async () => {
      const req = { body: { Nombre: "Camisa" } };
      const res = mockRes();

      await createArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Faltan campos requeridos" });
    });

    it("debería manejar errores de prepare", async () => {
      const req = {
        body: {
          Nombre: "Camisa",
          Categoria: "Ropa",
          PrecioProveedor: 100,
          PrecioVenta: 150,
          Temporada: "Verano"
        }
      };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) => cb(new Error("Prepare error")));

      await createArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Prepare error" });
    });

    it("debería manejar errores de exec", async () => {
      const req = {
        body: {
          Nombre: "Camisa",
          Categoria: "Ropa",
          PrecioProveedor: 100,
          PrecioVenta: 150,
          Temporada: "Verano"
        }
      };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(new Error("Exec error"))
        })
      );

      await createArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Exec error" });
    });
  });

  describe("updateArticulo", () => {
    it("debería actualizar un artículo", async () => {
      const req = {
        params: { id: 1 },
        body: {
          Nombre: "Camisa actualizada",
          Categoria: "Ropa",
          PrecioProveedor: 100,
          PrecioVenta: 160,
          Temporada: "Otoño"
        }
      };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(null)
        })
      );

      await updateArticulo(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Artículo actualizado correctamente" });
    });

    it("debería devolver 400 si faltan campos", async () => {
      const req = { params: {}, body: {} };
      const res = mockRes();

      await updateArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Faltan campos requeridos" });
    });

    it("debería manejar errores de base de datos", async () => {
      const req = {
        params: { id: 1 },
        body: {
          Nombre: "Camisa",
          Categoria: "Ropa",
          PrecioProveedor: 100,
          PrecioVenta: 150,
          Temporada: "Invierno"
        }
      };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(new Error("Update error"))
        })
      );

      await updateArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Update error" });
    });
  });

  describe("deleteArticulo", () => {
    it("debería eliminar un artículo", async () => {
      const req = { params: { id: 1 } };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(null)
        })
      );

      await deleteArticulo(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Artículo eliminado correctamente" });
    });

    it("debería devolver 400 si falta ID", async () => {
      const req = { params: {} };
      const res = mockRes();

      await deleteArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ID de artículo requerido" });
    });

    it("debería manejar errores de base de datos", async () => {
      const req = { params: { id: 1 } };
      const res = mockRes();

      db.connection.prepare.mockImplementation((query, cb) =>
        cb(null, {
          exec: (params, cb2) => cb2(new Error("Delete error"))
        })
      );

      await deleteArticulo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Delete error" });
    });
  });
});
