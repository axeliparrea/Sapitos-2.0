const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventario2Controller");

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión del inventario
 */

/**
 * @swagger
 * /inventario2:
 *   get:
 *     summary: Obtener todos los inventarios
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de inventarios
 */
router.get("/", controller.getInventario);

/**
 * @swagger
 * /inventario2:
 *   post:
 *     summary: Crear un nuevo inventario
 *     tags: [Inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Articulo_ID:
 *                 type: integer
 *               Location_ID:
 *                 type: integer
 *               StockActual:
 *                 type: integer
 *               Importacion:
 *                 type: integer
 *               Exportacion:
 *                 type: integer
 *               StockMinimo:
 *                 type: integer
 *               StockRecomendado:
 *                 type: integer
 *               FechaUltimaImp:
 *                 type: string
 *                 format: date-time
 *               FechaUltimaExp:
 *                 type: string
 *                 format: date-time
 *               MargenGanancia:
 *                 type: number
 *               TiempoReposi:
 *                 type: integer
 *               StockSeguridad:
 *                 type: integer
 *               DemandaProm:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inventario creado
 */
router.post("/", controller.createInventario);

/**
 * @swagger
 * /inventario2/{id}:
 *   put:
 *     summary: Actualizar inventario por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Articulo_ID:
 *                 type: integer
 *               Location_ID:
 *                 type: integer
 *               StockActual:
 *                 type: integer
 *               Importacion:
 *                 type: integer
 *               Exportacion:
 *                 type: integer
 *               StockMinimo:
 *                 type: integer
 *               StockRecomend:
 *                 type: integer
 *               FechaUltimaImp:
 *                 type: string
 *                 format: date-time
 *               FechaUltimaExp:
 *                 type: string
 *                 format: date-time
 *               MargenGanancia:
 *                 type: number
 *               TiempoReposi:
 *                 type: integer
 *               StockSeguridad:
 *                 type: integer
 *               DemandaProm:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Inventario actualizado
 */
router.put("/:id", controller.updateInventario);

/**
 * @swagger
 * /inventario2/{id}:
 *   delete:
 *     summary: Eliminar inventario por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventario eliminado
 */
router.delete("/:id", controller.deleteInventario);

module.exports = router;
