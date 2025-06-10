const express = require("express");
const router = express.Router();
const { getAlertas, deleteAlerta, generarNotificacion } = require("../controllers/alertaController");
const { auth } = require('../middleware/auth');

/**
 * Ruta para obtener todas las alertas
 */
router.get("/", (req, res) => {
  console.log("📣 Ruta principal de alertas accedida");
  console.log("Query params recibidos:", req.query);
  getAlertas(req, res);
});

/**
 * Ruta para obtener alertas por location_id como parámetro de consulta
 */
router.get("/location/:locationId", (req, res) => {
  console.log("📣 Ruta location/:locationId accedida");
  console.log("Location ID de ruta:", req.params.locationId);
  req.query.location_id = req.params.locationId;
  getAlertas(req, res);
});

/**
 * @swagger
 * /alertas:
 *   get:
 *     summary: Obtener todas las alertas
 *     tags: [Alertas]
 *     parameters:
 *       - in: query
 *         name: rol_id
 *         schema:
 *           type: integer
 *         description: Filtrar por rol ID
 *       - in: query
 *         name: usuario_id
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario ID
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: integer
 *         description: Filtrar por location ID
 *     responses:
 *       200:
 *         description: Lista de alertas
 */
router.get("/", auth, getAlertas);

/**
 * Eliminar una alerta por ID
 */
router.delete("/:id", (req, res) => {
  console.log("📣 Eliminar alerta:", req.params.id);
  deleteAlerta(req, res);
});

module.exports = router; 