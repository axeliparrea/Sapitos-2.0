const express = require("express");
const {
  getPedido,
  insertPedido,
  deletePedido,
  updatePedido,
  getProveedores,
  getProductosPorProveedor,
  aprobarPedido,
  entregarPedido,
  getPedidosProveedor,
  getDetallesPedido,
  enviarAInventario,
  getProveedoresInventario,
  getProductosInventarioPorProveedor
} = require('../controllers/pedidosController');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /pedido:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   creadaPor:
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
 *                     type: number
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
router.get("/", getPedido);
// router.get("/", auth(["admin", "dueno", "empleado"]), getPedido);

/**
 * @swagger
 * /pedido:
 *   post:
 *     summary: Insertar un nuevo pedido
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creadaPor
 *               - productos
 *               - total
 *             properties:
 *               creadaPor:
 *                 type: string
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *                     precio:
 *                       type: number
 *               total:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *               descuentoAplicado:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *                 pedidoId:
 *                   type: integer
 *                 totalProductos:
 *                   type: integer
 *                 total:
 *                   type: number
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", insertPedido);
// router.post("/", auth(["admin", "dueno", "empleado"]), insertPedido);

/**
 * @swagger
 * /pedido/proveedores:
 *   get:
 *     summary: Obtener lista de proveedores con conteo de productos
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                   totalProductos:
 *                     type: integer
 *       500:
 *         description: Error del servidor
 */
router.get("/proveedores", getProveedores);

/**
 * @swagger
 * /pedido/proveedores/{nombreProveedor}:
 *   get:
 *     summary: Obtener productos de un proveedor específico
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombreProveedor
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del proveedor
 *     responses:
 *       200:
 *         description: Lista de productos del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   categoria:
 *                     type: string
 *                   stockActual:
 *                     type: integer
 *                   precioCompra:
 *                     type: number
 *                   precioVenta:
 *                     type: number
 *                   temporada:
 *                     type: string
 *                   fechaUltimaCompra:
 *                     type: string
 *                     format: date
 *                   proveedor:
 *                     type: string
 *       400:
 *         description: Nombre de proveedor requerido
 *       500:
 *         description: Error del servidor
 */
router.get("/proveedores/:nombreProveedor", getProductosPorProveedor);

/**
 * @swagger
 * /pedido/{id}/aprobar:
 *   put:
 *     summary: Aprobar un pedido
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a aprobar
 *     responses:
 *       200:
 *         description: Pedido aprobado exitosamente
 *       400:
 *         description: Solo se pueden aprobar pedidos en estado Pendiente
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id/aprobar", aprobarPedido);

/**
 * @swagger
 * /pedido/{id}/entregar:
 *   put:
 *     summary: Marcar pedido como entregado
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a entregar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               calidad:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 5
 *               entregaATiempo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Pedido marcado como entregado
 *       400:
 *         description: Solo se pueden entregar pedidos en estado Aprobado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id/entregar", entregarPedido);

/**
 * @swagger
 * /pedido/{id}/inventario:
 *   put:
 *     summary: Enviar productos del pedido al inventario
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a enviar al inventario
 *     responses:
 *       200:
 *         description: Productos agregados al inventario exitosamente
 *       400:
 *         description: Solo se pueden enviar al inventario pedidos en estado Completado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id/inventario", enviarAInventario);

/**
 * @swagger
 * /pedido/proveedor/{correo}:
 *   get:
 *     summary: Obtener pedidos de un proveedor específico
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *         description: Correo del proveedor
 *     responses:
 *       200:
 *         description: Lista de pedidos del proveedor
 *       400:
 *         description: Correo del proveedor requerido
 *       500:
 *         description: Error del servidor
 */
router.get("/proveedor/:correo", getPedidosProveedor);

/**
 * @swagger
 * /pedido/{id}/detalles:
 *   get:
 *     summary: Obtener detalles de un pedido específico
 *     tags: [Pedido]
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
 *                   ID:
 *                     type: integer
 *                   NOMBRE:
 *                     type: string
 *                   CATEGORIA:
 *                     type: string
 *                   CANTIDAD:
 *                     type: integer
 *                   PRECIOUNITARIO:
 *                     type: number
 *                   TOTAL:
 *                     type: number
 *       400:
 *         description: ID de pedido inválido
 *       500:
 *         description: Error del servidor
 */
router.get("/:id/detalles", getDetallesPedido);

// Eliminar pedido por ID
/**
 * @swagger
 * /pedido/{id}:
 *   delete:
 *     summary: Eliminar un pedido por ID
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a eliminar
 *     responses:
 *       200:
 *         description: Pedido eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", deletePedido);

// Actualizar pedido por ID
/**
 * @swagger
 * /pedido/{id}:
 *   put:
 *     summary: Actualizar un pedido por ID
 *     tags: [Pedido]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               creadaPor:
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
 *                 type: number
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
 *       200:
 *         description: Pedido actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", updatePedido);

// Rutas adicionales para compatibilidad con el frontend
/**
 * @swagger
 * /pedido/inventory/proveedor:
 *   get:
 *     summary: Obtener proveedores para inventario (compatibilidad frontend)
 *     tags: [Pedido]
 *     responses:
 *       200:
 *         description: Lista de proveedores
 */
router.get("/inventory/proveedor", getProveedoresInventario);

/**
 * @swagger
 * /pedido/inventory/proveedores/{nombreProveedor}:
 *   get:
 *     summary: Obtener productos de proveedor para inventario (compatibilidad frontend)
 *     tags: [Pedido]
 *     parameters:
 *       - in: path
 *         name: nombreProveedor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos del proveedor
 */
router.get("/inventory/proveedores/:nombreProveedor", getProductosInventarioPorProveedor);

module.exports = router;