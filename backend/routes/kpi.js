const express = require("express");
const router = express.Router();
const {
  getVentasKpi,
  getUnidadesKpi,
  getArticulosKpi,
  getClientesKpi,
  getUnidadesVendidasGraph,
} = require("../controllers/kpiController");

// KPI routes
router.get("/ventas", getVentasKpi);
router.get("/unidades", getUnidadesKpi);
router.get("/articulos", getArticulosKpi);
router.get("/clientes", getClientesKpi);
router.get("/unidades-vendidas-graph", getUnidadesVendidasGraph);

module.exports = router; 