const express = require("express");
const {
  getInventory,
  insertInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
<<<<<<< Updated upstream
  getProveedores,
  getProductosPorProveedor
=======
  getLocaciones,
  getInventoryByLocation,
  getArticulos,
  getInventoryByCategory,
  getProductosEnRiesgo
>>>>>>> Stashed changes
} = require("../controllers/inventoryController");

const router = express.Router();
const { auth } = require("../middleware/auth");
const { requireOtpVerification } = require("../middleware/requireOtp");

<<<<<<< Updated upstream
const { auth } = require('../middleware/auth');

=======
>>>>>>> Stashed changes
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Gestión de inventario
 */

/**
 * @swagger
 * /api/inventory:
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

// router.get("/", auth(["admin", "dueno", "empleado"]), getInventory);
router.get("/", getInventory);

<<<<<<< Updated upstream
=======
/**
 * @swagger
 * /api/inventory/risk-products:
 *   get:
 *     summary: Obtener productos en riesgo (stock crítico o bajo)
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de productos en riesgo
 *       500:
 *         description: Error del servidor
 */
router.get("/risk-products", auth(["admin", "dueno", "empleado"]), getProductosEnRiesgo);
>>>>>>> Stashed changes

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
<<<<<<< Updated upstream
 *         description: ID of the inventory item
 *     security:
 *       - bearerAuth: []
=======
 *         description: ID del item de inventario
 *         schema:
 *           type: integer
>>>>>>> Stashed changes
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
 * /api/inventory:
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
<<<<<<< Updated upstream
 *               - nombre
 *               - stock
=======
 *               - articuloId
 *               - locationId
 *               - stockActual
>>>>>>> Stashed changes
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
 * /api/inventory/{id}:
 *   put:
<<<<<<< Updated upstream
 *     summary: Update an inventory item
=======
 *     summary: Actualizar stock actual, importación o exportación de un item de inventario
>>>>>>> Stashed changes
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
<<<<<<< Updated upstream
 *         description: ID of the inventory item
=======
 *         description: ID del item de inventario
 *         schema:
 *           type: integer
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
 *                 description: Nuevo valor del stock actual
 *               importacion:
 *                 type: integer
 *                 description: Cantidad total importada (se actualiza FechaUltimaImportacion)
 *               exportacion:
 *                 type: integer
 *                 description: Cantidad total exportada (se actualiza FechaUltimaExportacion)
 *             example:
 *               stockActual: 150
 *               importacion: 30
 *               exportacion: 10
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *       400:
 *         description: No se proporcionaron campos válidos para actualizar
>>>>>>> Stashed changes
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
<<<<<<< Updated upstream
router.put("/:id", auth(["admin", "dueno"]), updateInventory);
=======

router.put("/:id", auth(["admin", "dueno"], true), requireOtpVerification, updateInventory);
>>>>>>> Stashed changes

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
<<<<<<< Updated upstream
 *         description: ID of the inventory item
 *     security:
 *       - bearerAuth: []
=======
 *         description: ID del item de inventario
 *         schema:
 *           type: integer
>>>>>>> Stashed changes
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
<<<<<<< Updated upstream
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
=======
router.delete("/:id", auth(["admin", "dueno"], true), requireOtpVerification, deleteInventory);

/**
 * @swagger
 * /api/inventory/locations/all:
 *   get:
 *     summary: Obtener todas las ubicaciones
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
 *       500:
 *         description: Error del servidor
 */
router.get("/locations/all", getLocaciones);

/**
 * @swagger
 * /api/inventory/location/{locationId}:
 *   get:
 *     summary: Obtener inventario por ubicación
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         description: ID de la ubicación
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de items en la ubicación
 *       404:
 *         description: No se encontraron items
 *       500:
 *         description: Error del servidor
 */
router.get("/location/:locationId", getInventoryByLocation);

/**
 * @swagger
 * /api/inventory/articles/all:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de artículos
 *       500:
 *         description: Error del servidor
 */
router.get("/articles/all", getArticulos);

/**
 * @swagger
 * /api/inventory/category/{categoria}:
 *   get:
 *     summary: Obtener inventario por categoría
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         description: Nombre de la categoría
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de items por categoría
 *       404:
 *         description: No se encontraron items
 *       500:
 *         description: Error del servidor
 */
router.get("/category/:categoria", getInventoryByCategory);

module.exports = router;
>>>>>>> Stashed changes
