const express = require("express");
const router = express.Router();
const { getAlertas, deleteAlerta, generarNotificacion } = require("../controllers/alertaController");
const { auth } = require('../middleware/auth');

/**
 * Ruta para obtener alertas por location_id
 */
router.get("/location/:locationId", auth, (req, res) => {
  // El location_id viene en los parámetros de ruta
  req.query.location_id = req.params.locationId;
  return getAlertas(req, res);
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
 * @swagger
 * /alertas/{id}:
 *   delete:
 *     summary: Eliminar una alerta
 *     tags: [Alertas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la alerta a eliminar
 *     responses:
 *       200:
 *         description: Alerta eliminada correctamente
 */
router.delete("/:id", auth, deleteAlerta);

module.exports = router; 