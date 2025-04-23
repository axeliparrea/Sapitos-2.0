const express = require("express");
const { 
  getPedido, insertPedido
} = require("../controllers/pedidosController");
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
 *                     type: number
 *                   estatus:
 *                     type: string
 *                   total:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */


// router.get("/", auth(["admin", "dueno", "empleado"]), getPedido);
router.get("/", getPedido);




// insert into db 
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
 *               - tipoOrden
 *               - organizacion
 *               - fechaCreacion
 *               - estatus
 *             properties:
 *               id:
 *                 type: integer
 *               creadaPor:
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
 *                 type: number
 *               estatus:
 *                 type: string
 *               total:
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
 *                 id:
 *                   type: integer
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post("/", insertPedido);
// router.post("/", auth(["admin", "dueno", "empleado"]), insertPedido);



module.exports = router; //importante
