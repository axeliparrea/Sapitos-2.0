const express = require("express");
const router = express.Router();
const { getLocations, createLocation } = require("../controllers/location2Controller");

/**
 * @swagger
 * /location2:
 *   get:
 *     summary: Obtener todas las ubicaciones
 *     tags: [Location2]
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
 */
router.get("/", getLocations);

/**
 * @swagger
 * /location2:
 *   post:
 *     summary: Crear una nueva ubicación
 *     tags: [Location2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Tipo:
 *                 type: string
 *               PosicionX:
 *                 type: integer
 *               PosicionY:
 *                 type: integer
 *               FechaCreado:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Ubicación creada
 */
router.post("/", createLocation);

module.exports = router;
