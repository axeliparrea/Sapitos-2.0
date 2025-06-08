const express = require("express");
const { 
  getPedidosPendientesProveedor,
  getInventarioProveedor,
  aceptarPedido,
  rechazarPedido,
  getDetallePedido,
  enviarPedido,
  getPedidosAceptadosProveedor ,
  getTodosPedidosProveedor
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
router.get("/pedidos/:locationId", getPedidosPendientesProveedor);

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
router.get("/inventario/:locationId", getInventarioProveedor);

/**
 * @swagger
 * /proveedor/pedido/{id}/aprobar:
 *   put:
 *     summary: Aceptar un pedido pendiente
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a aceptar
 *     responses:
 *       200:
 *         description: Pedido aceptado exitosamente
 *       400:
 *         description: ID de pedido inválido o pedido no está pendiente
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/pedido/:id/aprobar", aceptarPedido);

/**
 * @swagger
 * /proveedor/pedido/{id}/rechazar:
 *   put:
 *     summary: Rechazar un pedido pendiente
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a rechazar
 *     responses:
 *       200:
 *         description: Pedido rechazado exitosamente
 *       400:
 *         description: ID de pedido inválido o pedido no está pendiente
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/pedido/:id/rechazar", rechazarPedido);

/**
 * @swagger
 * /proveedor/pedido/{id}/detalle:
 *   get:
 *     summary: Obtener detalles de un pedido específico
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Detalles del pedido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   articuloId:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   categoria:
 *                     type: string
 *                   cantidad:
 *                     type: integer
 *                   precioUnitario:
 *                     type: number
 *                   subtotal:
 *                     type: number
 *                   stockDisponible:
 *                     type: integer
 *       400:
 *         description: ID de pedido inválido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/pedido/:id/detalle", getDetallePedido);

/**
 * @swagger
 * /proveedor/pedido/{id}/enviar:
 *   put:
 *     summary: Marcar pedido como enviado/en reparto
 *     tags: [Proveedor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a enviar
 *     responses:
 *       200:
 *         description: Pedido marcado como enviado y stock actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 productosEnviados:
 *                   type: integer
 *                 nuevoEstado:
 *                   type: string
 *       400:
 *         description: ID inválido, pedido no está aprobado o stock insuficiente
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/pedido/:id/enviar", enviarPedido);

router.get('/pedidos/:locationId', getTodosPedidosProveedor); 
router.get('/pedidos-aceptados/:locationId', getPedidosAceptadosProveedor);

module.exports = router;