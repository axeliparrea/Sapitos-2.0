const express = require("express");
const router = express.Router();

const {
  getOrdenesRecibidas
} = require("../controllers/ordenesController");

const {
  getOrdenesProductos,
  getByOrdenId,
  createOrdenProducto,
  deleteOrdenProducto,
  getDetallePorOrden
} = require("../controllers/ordenesProductosController");

/**
 * @swagger
 * tags:
 *   name: ordenesProductos
 *   description: Gestión de productos dentro de órdenes
 */

/**
 * @swagger
 * /ordenesProductos:
 *   get:
 *     summary: Obtener todos los productos en órdenes
 *     tags: [OrdenesProductos]
 *     responses:
 *       200:
 *         description: Lista de productos en órdenes
 *       500:
 *         description: Error del servidor
 */
router.get("/ordenesProductos", getOrdenesProductos);

/**
 * @swagger
 * /ordenesProductos/orden/{id}:
 *   get:
 *     summary: Obtener productos de una orden específica por su ID
 *     tags: [OrdenesProductos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de productos en la orden
 *       404:
 *         description: Orden no encontrada
 */
router.get("/ordenesProductos/orden/:id", getByOrdenId);

/**
 * @swagger
 * /ordenesProductos:
 *   post:
 *     summary: Agregar un producto a una orden
 *     tags: [OrdenesProductos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Orden_ID
 *               - Inventario_ID
 *               - Cantidad
 *               - PrecioUnitario
 *             properties:
 *               Orden_ID:
 *                 type: integer
 *               Inventario_ID:
 *                 type: integer
 *               Cantidad:
 *                 type: integer
 *               PrecioUnitario:
 *                 type: number
 *     responses:
 *       201:
 *         description: Producto agregado a la orden
 *       500:
 *         description: Error al agregar el producto
 */
router.post("/ordenesProductos", createOrdenProducto);

/**
 * @swagger
 * /ordenesProductos/{id}:
 *   delete:
 *     summary: Eliminar un producto de una orden
 *     tags: [OrdenesProductos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       500:
 *         description: Error al eliminar el producto
 */
router.delete("/ordenesProductos/:id", deleteOrdenProducto);

/**
 * @swagger
 * /ordenesProductos/getDetallePorOrden/{id}:
 *   get:
 *     summary: Obtener el detalle de productos de una orden, incluyendo nombre de artículo y stock
 *     tags: [OrdenesProductos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Detalle de productos de la orden
 *       500:
 *         description: Error al obtener el detalle
 */
router.get("/ordenesProductos/getDetallePorOrden/:id", getDetallePorOrden);

/**
 * @swagger
 * /ordenes/recibidas/{locationId}:
 *   get:
 *     summary: Obtener todas las órdenes recibidas por una ubicación
 *     tags: [OrdenesProductos]
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación (almacén, proveedor, sucursal, etc.)
 *     responses:
 *       200:
 *         description: Lista de órdenes recibidas
 *       500:
 *         description: Error al obtener las órdenes
 */
router.get("/recibidas/:locationId", getOrdenesRecibidas);


module.exports = router;
