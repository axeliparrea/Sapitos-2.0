const express = require("express");
const { 
  getPedidosPendientesProveedor,
  getInventarioProveedor
} = require('../controllers/pedidosProveedorController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoProveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del pedido
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha de creación del pedido
 *         solicitadoPor:
 *           type: string
 *           description: Nombre de quien solicitó el pedido
 *         total:
 *           type: number
 *           description: Monto total del pedido
 *         estado:
 *           type: string
 *           description: Estado actual del pedido
 *         fechaEstimada:
 *           type: string
 *           format: date
 *           description: Fecha estimada de entrega
 *     
 *     InventarioProveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del inventario
 *         nombre:
 *           type: string
 *           description: Nombre del artículo
 *         categoria:
 *           type: string
 *           description: Categoría del artículo
 *         stockActual:
 *           type: integer
 *           description: Cantidad actual en stock
 *         stockMinimo:
 *           type: integer
 *           description: Cantidad mínima requerida
 *         precioProveedor:
 *           type: number
 *           description: Precio de compra
 *         precioVenta:
 *           type: number
 *           description: Precio de venta
 *         ultimaCompra:
 *           type: string
 *           format: date
 *           description: Fecha de última compra
 *         margen:
 *           type: number
 *           description: Margen de ganancia
 */

/**
 * @swagger
 * /proveedor/pedidos/{locationId}:
 *   get:
 *     summary: Obtener pedidos pendientes del proveedor
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación del proveedor
 *     responses:
 *       200:
 *         description: Lista de pedidos pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoProveedor'
 *       400:
 *         description: ID de ubicación inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get("/pedidos/:locationId",  getPedidosPendientesProveedor);

/**
 * @swagger
 * /proveedor/inventario/{locationId}:
 *   get:
 *     summary: Obtener inventario del proveedor
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación del proveedor
 *     responses:
 *       200:
 *         description: Inventario del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventarioProveedor'
 *       400:
 *         description: ID de ubicación inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get("/inventario/:locationId",  getInventarioProveedor);

module.exports = router;