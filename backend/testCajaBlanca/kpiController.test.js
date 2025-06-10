jest.mock("../config/db", () => ({
  connection: {
    exec: jest.fn()
  }
}));

const {
  getVentasKpi,
  getUnidadesKpi,
  getArticulosKpi,
  getClientesKpi,
  getUnidadesVendidasGraph
} = require("../controllers/kpiController");

const db = require("../config/db");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("kpiController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const kpiTests = [
    { name: "getVentasKpi", fn: getVentasKpi },
    { name: "getUnidadesKpi", fn: getUnidadesKpi },
    { name: "getArticulosKpi", fn: getArticulosKpi },
    { name: "getClientesKpi", fn: getClientesKpi }
  ];

  kpiTests.forEach(({ name, fn }) => {
    describe(name, () => {
      it(`debería retornar KPI correctamente sin location`, async () => {
        const req = { query: {} };
        const res = mockRes();

        db.connection.exec.mockImplementation((query, params, cb) => {
          cb(null, [{ CURRENT_TOTAL: "120", PREVIOUS_TOTAL: "100" }]);
        });

        await fn(req, res);

        expect(res.json).toHaveBeenCalledWith({
          total: 120,
          percentage_change: 20
        });
      });

      it(`debería retornar 500 si hay error de base de datos`, async () => {
        const req = { query: {} };
        const res = mockRes();

        db.connection.exec.mockImplementation((query, params, cb) => {
          cb(new Error("Error"));
        });

        await fn(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.stringContaining("Error al obtener KPI")
        }));
      });

      it(`debería retornar KPI correctamente con locationId`, async () => {
        const req = { query: { locationId: "1" } };
        const res = mockRes();

        db.connection.exec.mockImplementation((query, params, cb) => {
          cb(null, [{ CURRENT_TOTAL: "80", PREVIOUS_TOTAL: "160" }]);
        });

        await fn(req, res);

        expect(res.json).toHaveBeenCalledWith({
          total: 80,
          percentage_change: -50
        });
      });
    });
  });

  describe("getUnidadesVendidasGraph", () => {
    it("debería retornar datos agrupados por mes por defecto", async () => {
      const req = { query: {} };
      const res = mockRes();

      const mockRows = [{ Anio: 2024, Mes: 5, unidades_vendidas: 200 }];
      db.connection.exec.mockImplementation((q, p, cb) => cb(null, mockRows));

      await getUnidadesVendidasGraph(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRows);
    });

    it("debería retornar datos agrupados por año si filter=yearly", async () => {
      const req = { query: { filter: "yearly" } };
      const res = mockRes();

      const mockRows = [{ Anio: 2023, unidades_vendidas: 1200 }];
      db.connection.exec.mockImplementation((q, p, cb) => cb(null, mockRows));

      await getUnidadesVendidasGraph(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRows);
    });

    it("debería manejar errores al obtener datos", async () => {
      const req = { query: {} };
      const res = mockRes();

      db.connection.exec.mockImplementation((q, p, cb) => cb(new Error("DB error")));

      await getUnidadesVendidasGraph(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener datos para gráfica de unidades vendidas"
      });
    });
  });
});
