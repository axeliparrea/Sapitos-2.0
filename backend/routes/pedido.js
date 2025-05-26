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
  enviarAInventario
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
 *               - fechaCreacion
 *               - estatus
 *               - total
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
 *       200:
 *         description: Pedido creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *     summary: Obtener lista de proveedores
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
 *                   ID:
 *                     type: integer
 *                   NOMBRE:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get("/proveedores", getProveedores);

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

// Rutas de proveedores
router.get('/', getProveedores);           
router.get('/:proveedorId/productos', getProductosPorProveedor);

module.exports = router;
