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
 *                   ARTICULO_ID:
 *                     type: integer
 *                   NOMBRE:
 *                     type: string
 *                   CATEGORIA:
 *                     type: string
 *                   PRECIOPROVEEDOR:
 *                     type: number
 *                   PRECIOVENTA:
 *                     type: number
 *                   TEMPORADA:
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
 *               - NOMBRE
 *               - CATEGORIA
 *               - PRECIOPROVEEDOR
 *               - PRECIOVENTA
 *               - TEMPORADA
 *             properties:
 *               NOMBRE:
 *                 type: string
 *               CATEGORIA:
 *                 type: string
 *               PRECIOPROVEEDOR:
 *                 type: number
 *               PRECIOVENTA:
 *                 type: number
 *               TEMPORADA:
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
 *               - NOMBRE
 *               - CATEGORIA
 *               - PRECIOPROVEEDOR
 *               - PRECIOVENTA
 *               - TEMPORADA
 *             properties:
 *               NOMBRE:
 *                 type: string
 *               CATEGORIA:
 *                 type: string
 *               PRECIOPROVEEDOR:
 *                 type: number
 *               PRECIOVENTA:
 *                 type: number
 *               TEMPORADA:
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
