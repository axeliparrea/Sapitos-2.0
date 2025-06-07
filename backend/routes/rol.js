const express = require("express");
const router = express.Router();
const { getRoles, createRol } = require("../controllers/rolController");

/**
 * @swagger
 * /rol/getRoles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Rol]
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get("/getRoles", getRoles);

/**
 * @swagger
 * /rol:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Rol]
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
