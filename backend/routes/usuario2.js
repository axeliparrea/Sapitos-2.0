const express = require("express");
const router = express.Router();

const {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  getSessionUsuario
} = require("../controllers/usuario2Controller");

/**
 * @swagger
 * tags:
 *   name: Usuario2
 *   description: Endpoints para la gestión de usuarios con autenticación
 */

/**
 * @swagger
 * /usuario2/getUsuario:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuario2]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/getUsuario", getUsuarios);

/**
 * @swagger
 * /usuario2:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuario2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Clave:
 *                 type: string
 *               Rol_ID:
 *                 type: integer
 *               Correo:
 *                 type: string
 *               Username:
 *                 type: string
 *               Location_ID:
 *                 type: integer
 *               FechaEmpiezo:
 *                 type: string
 *                 format: date
 *               RFC:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 */
router.post("/", createUsuario);

/**
 * @swagger
 * /usuario2:
 *   put:
 *     summary: Modificar un usuario existente
 *     tags: [Usuario2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Usuario_ID:
 *                 type: integer
 *               Nombre:
 *                 type: string
 *               Rol_ID:
 *                 type: integer
 *               Location_ID:
 *                 type: integer
 *               FechaEmpiezo:
 *                 type: string
 *                 format: date
 *               RFC:
 *                 type: string
 *               Correo:
 *                 type: string
 *               Username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 */
router.put("/", updateUsuario);

/**
 * @swagger
 * /usuario2:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuario2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Usuario_ID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete("/", deleteUsuario);

/**
 * @swagger
 * /usuario2/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuario2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correoOUsuario:
 *                 type: string
 *               Clave:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con JWT
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", loginUsuario);

/**
 * @swagger
 * /usuario2/getSession:
 *   get:
 *     summary: Verificar sesión del usuario actual
 *     tags: [Usuario2]
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: No autenticado o token inválido
 */
router.get("/getSession", getSessionUsuario);

/**
 * @swagger
 * /usuario2/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Usuario2]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post("/logout", require("../controllers/usuario2Controller").logoutUsuario);


module.exports = router;
