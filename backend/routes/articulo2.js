const express = require("express");
const router = express.Router();
const {
  getArticulos,
  createArticulo,
  updateArticulo,
  deleteArticulo
} = require("../controllers/articulo2Controller");

/**
 * @swagger
 * tags:
 *   name: Articulo2
 *   description: Gestión de artículos
 */

/**
 * @swagger
 * /articulo2:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Articulo2]
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
 * /articulo2:
 *   post:
 *     summary: Crear un nuevo artículo
 *     tags: [Articulo2]
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
 * /articulo2/{id}:
 *   put:
 *     summary: Actualizar un artículo existente
 *     tags: [Articulo2]
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

// ejemplo en backend/rutas/articulo2.js
router.delete("/:id", deleteArticulo);


module.exports = router;
