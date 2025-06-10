const express = require("express");
const {
  getOrden,
  insertOrden,
  deleteOrden,
  getOrdenesPorLocation,
  getOrdenesPorCreador
} = require("../controllers/ordenesController");

const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /ordenes:
 *   get:
 *     summary: Obtener todas las órdenes
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   creada_por:
 *                     type: string
 *                   tipoOrden:
 *                     type: string
 *                   organizacion:
 *                     type: string
 *                   fechaCreacion:
 *                     type: string
 *                     format: date
 *                   fechaEstimaAceptacion:
 *                     type: string
 *                     format: date
 *                   fechaAceptacion:
 *                     type: string
 *                     format: date
 *                   fechaEstimaPago:
 *                     type: string
 *                     format: date
 *                   fechaPago:
 *                     type: string
 *                     format: date
 *                   comprobantePago:
 *                     type: string
 *                   fechaEstimaEntrega:
 *                     type: string
 *                     format: date
 *                   fechaEntrega:
 *                     type: string
 *                     format: date
 *                   entregaATiempo:
 *                     type: boolean
 *                   calidad:
 *                     type: string
 *                   estatus:
 *                     type: string
 *                   total:
 *                     type: number
 *                   metodoPago:
 *                     type: string
 *                   descuentoAplicado:
 *                     type: number
 *                   tiempoReposicion:
 *                     type: number
 *                   tiempoEntrega:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
router.get("/", auth(["admin", "dueno", "empleado"]), getOrden);
// router.get("/", getOrden);


/**
 * @swagger
 * /ordenes:
 *   post:
 *     summary: Insertar una nueva orden
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creada_por
 *               - tipoOrden
 *               - organizacion
 *             properties:
 *               creada_por:
 *                 type: string
 *               tipoOrden:
 *                 type: string
 *               organizacion:
 *                 type: string
 *               fechaCreacion:
 *                 type: string
 *                 format: date
 *               fechaEstimaAceptacion:
 *                 type: string
 *                 format: date
 *               fechaAceptacion:
 *                 type: string
 *                 format: date
 *               fechaEstimaPago:
 *                 type: string
 *                 format: date
 *               fechaPago:
 *                 type: string
 *                 format: date
 *               comprobantePago:
 *                 type: string
 *               fechaEstimaEntrega:
 *                 type: string
 *                 format: date
 *               fechaEntrega:
 *                 type: string
 *                 format: date
 *               entregaATiempo:
 *                 type: boolean
 *               calidad:
 *                 type: string
 *               estatus:
 *                 type: string
 *               total:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *               descuentoAplicado:
 *                 type: number
 *               tiempoReposicion:
 *                 type: number
 *               tiempoEntrega:
 *                 type: number
 *     responses:
 *       201:
 *         description: Orden insertada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", auth(["admin", "dueno"]), insertOrden);

/**
 * @swagger
 * /ordenes/{id}:
 *   delete:
 *     summary: Eliminar una orden por ID
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden a eliminar
 *     responses:
 *       200:
 *         description: Orden eliminada exitosamente
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", auth(["admin", "dueno"]), deleteOrden);

router.get("/recibidas/:locationId", auth(["admin", "dueno", "empleado"]), getOrdenesPorLocation);

router.get("/creadas/:creadorId", auth(["admin", "dueno", "empleado"]), getOrdenesPorCreador);

module.exports = router;
