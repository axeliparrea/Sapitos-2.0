const express = require("express");
const router = express.Router();
const { getArticulos, createArticulo } = require("../controllers/articulo2Controller");

/**
 * @swagger
 * /articulo2:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Articulo2]
 *     responses:
 *       200:
 *         description: Lista de artículos
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

module.exports = router;
