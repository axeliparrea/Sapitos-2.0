const express = require("express");
const router = express.Router();
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById
} = require("../controllers/locationController");

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

/**
 * @swagger
 * /location2/{id}:
 *   put:
 *     summary: Actualizar una ubicación por ID
 *     tags: [Location2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Ubicación actualizada
 */
router.put("/:id", updateLocation);

/**
 * @swagger
 * /location2/{id}:
 *   delete:
 *     summary: Eliminar una ubicación por ID
 *     tags: [Location2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ubicación eliminada
 */
router.delete("/:id", deleteLocation);

/**
 * @swagger
 * /location2/getByID/{id}:
 *   get:
 *     summary: Obtener ubicación por ID
 *     tags: [Location2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la ubicación
 */

router.get("/getByID/:id", getLocationById);



module.exports = router;
