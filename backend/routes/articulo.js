const express = require("express");
const router = express.Router();
const {
  getArticulos,
  createArticulo,
  updateArticulo,
  deleteArticulo
} = require("../controllers/articuloController");

/**
 * @swagger
 * tags:
 *   name: Articulo
 *   description: Gestión de artículos
 */

/**
 * @swagger
 * /articulo:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Articulo]
 *     responses:
 *       200:
 *         description: Lista de artículos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Articulo_ID:
 *                     type: integer
 *                   Nombre:
 *                     type: string
 *                   Categoria:
 *                     type: string
 *                   PrecioProveedor:
 *                     type: number
 *                   PrecioVenta:
 *                     type: number
 *                   Temporada:
 *                     type: string
 */
router.get("/", getArticulos);

/**
 * @swagger
 * /articulo:
 *   post:
 *     summary: Crear un nuevo artículo
 *     tags: [Articulo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Categoria
 *               - PrecioProveedor
 *               - PrecioVenta
 *               - Temporada
 *             properties:
 *               Nombre:
 *                 type: string
 *               Categoria:
 *                 type: string
 *               PrecioProveedor:
 *                 type: number
 *               PrecioVenta:
 *                 type: number
 *               Temporada:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artículo creado
 */
router.post("/", createArticulo);

/**
 * @swagger
 * /articulo/{id}:
 *   put:
 *     summary: Actualizar un artículo existente
 *     tags: [Articulo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del artículo a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Categoria
 *               - PrecioProveedor
 *               - PrecioVenta
 *               - Temporada
 *             properties:
 *               Nombre:
 *                 type: string
 *               Categoria:
 *                 type: string
 *               PrecioProveedor:
 *                 type: number
 *               PrecioVenta:
 *                 type: number
 *               Temporada:
 *                 type: string
 *     responses:
 *       200:
 *         description: Artículo actualizado correctamente
 *       500:
 *         description: Error del servidor
 */
router.put("/:id", updateArticulo);

/**
 * @swagger
 * /articulo/{id}:
 *   delete:
 *     summary: Eliminar un artículo por ID
 *     tags: [Articulo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del artículo a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo eliminado correctamente
 *       500:
 *         description: Error del servidor
 */
router.delete("/:id", deleteArticulo);

module.exports = router;
