const express = require("express");
const router = express.Router();
const { getRoles, createRol } = require("../controllers/rol2Controller");

/**
 * @swagger
 * /rol2:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Rol2]
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get("/", getRoles);

/**
 * @swagger
 * /rol2:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Rol2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rol creado
 */
router.post("/", createRol);

module.exports = router;
