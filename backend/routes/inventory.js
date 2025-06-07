const express = require("express");
const { 
  getInventory, 
  insertInventory, 
  getInventoryById, 
  updateInventory, 
  deleteInventory,
  getLocaciones,
  getInventoryByLocation,
  getArticulos,
  getInventoryByCategory,
  getProveedores,
  getProductosPorProveedor
} = require("../controllers/inventoryController");
const router = express.Router();

const { auth } = require('../middleware/auth');
const { requireOtpVerification } = require('../middleware/requireOtp');

// Rutas principales de inventario
/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Obtener todos los items del inventario
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de items de inventario
 *       500:
 *         description: Error del servidor
 */
router.get("/", getInventory);

/**
 * @swagger
 * /inventory/{id}:
 *   get:
 *     summary: Obtener un item de inventario por ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del item de inventario
 *     responses:
 *       200:
 *         description: Detalles del item de inventario
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", auth(["admin", "dueno", "empleado"], true), requireOtpVerification, getInventoryById);

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Agregar un nuevo item al inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articuloId:
 *                 type: integer
 *               locationId:
 *                 type: integer
 *               stockActual:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item agregado exitosamente
 *       400:
 *         description: Solicitud inválida
 *       500:
 *         description: Error del servidor
 */
router.post("/", auth(["admin", "dueno"], true), requireOtpVerification, insertInventory);

/**
 * @swagger
 * /inventory/{id}:
 *   put:
 *     summary: Actualizar un item de inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del item de inventario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockActual:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", auth(["admin", "dueno"], true), requireOtpVerification, updateInventory);

/**
 * @swagger
 * /inventory/{id}:
 *   delete:
 *     summary: Eliminar un item de inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del item de inventario
 *     responses:
 *       200:
 *         description: Item eliminado exitosamente
 *       404:
 *         description: Item no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", auth(["admin", "dueno"], true), requireOtpVerification, deleteInventory);

// Rutas adicionales de inventario
/**
 * @swagger
 * /inventory/locations/all:
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
 * /inventory/location/{locationId}:
 *   get:
 *     summary: Obtener inventario por ubicación
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         description: ID de la ubicación
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
 * /inventory/articles/all:
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
 * /inventory/category/{categoria}:
 *   get:
 *     summary: Obtener inventario por categoría
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         description: Nombre de la categoría
 *     responses:
 *       200:
 *         description: Lista de items por categoría
 *       404:
 *         description: No se encontraron items
 *       500:
 *         description: Error del servidor
 */
router.get("/category/:categoria", getInventoryByCategory);

// Rutas de proveedores (manteniendo el prefijo /inventory)
/**
 * @swagger
 * /inventory/proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *       500:
 *         description: Error del servidor
 */
// router.get("/proveedores/all", getProveedores);

/**
 * @swagger
 * /inventory/proveedores/{proveedor}:
 *   get:
 *     summary: Obtener productos por proveedor
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: proveedor
 *         required: true
 *         description: Nombre del proveedor
 *     responses:
 *       200:
 *         description: Lista de productos del proveedor
 *       404:
 *         description: No se encontraron productos
 *       500:
 *         description: Error del servidor
 */
// router.get("/proveedores/:proveedor", getProductosPorProveedor);

module.exports = router;