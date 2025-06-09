const express = require("express");
const router = express.Router();
const { getAlertas, deleteAlerta, createAlerta } = require("../controllers/alertaController");
const { auth } = require('../middleware/auth');

/**
 * Ruta para crear una notificación personalizada (sin autenticación, útil para desarrollo)
 */
router.get("/test/:tipo", (req, res) => {
  const { tipo } = req.params;
  const { titulo, mensaje, location_id, orden_id } = req.query;
  
  console.log(`Creando alerta de prueba tipo: ${tipo}`);
  
  // Validar el tipo
  const tiposValidos = ['success', 'danger', 'warning', 'info', 'primary'];
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : 'primary';
  
  // Crear una alerta de prueba
  const alertaTest = {
    descripcion: mensaje || `Esta es una alerta de prueba de tipo ${tipoFinal} creada el ${new Date().toLocaleString()}`,
    location_id: location_id || 1,
    prioridad: 1,
    orden_producto_id: orden_id || null
  };
  
  // Usar directamente la función del controlador
  req.body = alertaTest;
  return createAlerta(req, res);
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

/**
 * @swagger
 * /alertas:
 *   post:
 *     summary: Crear una nueva alerta
 *     tags: [Alertas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - location_id
 *             properties:
 *               descripcion:
 *                 type: string
 *               location_id:
 *                 type: integer
 *               prioridad:
 *                 type: integer
 *                 default: 1
 *               orden_producto_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Alerta creada correctamente
 */
router.post("/", auth, createAlerta);

module.exports = router; 