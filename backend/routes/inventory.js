const express = require("express");
const { 
  getInventory, 
  insertInventory, 
  getInventoryById, 
  updateInventory, 
  deleteInventory,
  getProveedores,
  getProductosPorProveedor
} = require("../controllers/inventoryController");
const router = express.Router();

const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   proveedor:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   categoria:
 *                     type: string
 *                   stockActual:
 *                     type: integer
 *                   stockMinimo:
 *                     type: integer
 *                   fechaUltimaCompra:
 *                     type: string
 *                     format: date
 *                   fechaUltimaVenta:
 *                     type: string
 *                     format: date
 *                   precioCompra:
 *                     type: number
 *                   precioVenta:
 *                     type: number
 *                   temporada:
 *                     type: string
 *                   margenGanancia:
 *                     type: number
 *                   tiempoReposicionProm:
 *                     type: number
 *                   demandaProm:
 *                     type: number
 *                   stockSeguridad:
 *                     type: number
 *       500:
 *         description: Server error
 */

router.get("/", auth(["admin", "dueno", "empleado"]), getInventory);
// router.get("/", getInventory);


/**
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the inventory item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory item details
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth(["admin", "dueno", "empleado"]), getInventoryById);

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Add a new inventory item
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - stock
 *             properties:
 *               id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               stock:
 *                 type: integer
 *               stockMinimo:
 *                 type: integer
 *               precioCompra:
 *                 type: number
 *               precioVenta:
 *                 type: number
 *               temporada:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory item added successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post("/", auth(["admin", "dueno"]), insertInventory);

/**
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               categoria:
 *                 type: string
 *               stockActual:
 *                 type: integer
 *               stockMinimo:
 *                 type: integer
 *               precioCompra:
 *                 type: number
 *               precioVenta:
 *                 type: number
 *               temporada:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.put("/:id", auth(["admin", "dueno"]), updateInventory);

/**
 * @swagger
 * /inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the inventory item
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth(["admin", "dueno"]), deleteInventory);

/**
 * @swagger
 * /proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Proveedores]
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
 *                   proveedor:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
// router.get("/", auth(["admin", "dueno", "empleado"]), getProveedores);
router.get("/", getProveedores);


/**
 * @swagger
 * /proveedores/{proveedor}:
 *   get:
 *     summary: Obtener todos los productos por proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: proveedor
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del proveedor
 *     security:
 *       - bearerAuth: []
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
 *                   proveedor:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   categoria:
 *                     type: string
 *                   stockActual:
 *                     type: integer
 *                   stockMinimo:
 *                     type: integer
 *                   fechaUltimaCompra:
 *                     type: string
 *                     format: date
 *                   fechaUltimaVenta:
 *                     type: string
 *                     format: date
 *                   precioCompra:
 *                     type: number
 *                   precioVenta:
 *                     type: number
 *                   temporada:
 *                     type: string
 *                   margenGanancia:
 *                     type: number
 *                   tiempoReposicionProm:
 *                     type: number
 *                   demandaProm:
 *                     type: number
 *                   stockSeguridad:
 *                     type: number
 *       404:
 *         description: No se encontraron productos para este proveedor
 *       500:
 *         description: Error del servidor
 */
// router.get("/:proveedor", auth(["admin", "dueno", "empleado"]), getProductosPorProveedor);
router.get("/:proveedor",getProductosPorProveedor);


module.exports = router;