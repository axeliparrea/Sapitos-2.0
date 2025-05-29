const express = require("express");
const { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser, getUserByEmail } = require("../controllers/userController");
const router = express.Router();

const { auth } = require('../middleware/auth'); // Import the middleware

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - nombre
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Email del usuario
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *               rol:
 *                 type: string
 *                 description: Nombre del rol del usuario
 *               rfc:
 *                 type: string
 *                 description: RFC del usuario
 *               location_id:
 *                 type: integer
 *                 description: ID de la ubicación del usuario
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Email del usuario
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Email or password incorrect
 *       500:
 *         description: Server error
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/getUsers:
 *   get:
 *     summary: Obtiene todos los usuarios registrados en el sistema
 *     description: Retorna una lista completa de usuarios con sus datos básicos desde la nueva estructura Usuario2
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del usuario
 *                   correo:
 *                     type: string
 *                     description: Correo electrónico del usuario
 *                   nombre:
 *                     type: string
 *                     description: Nombre completo del usuario
 *                   username:
 *                     type: string
 *                     description: Nombre de usuario
 *                   rol:
 *                     type: string
 *                     description: Nombre del rol del usuario
 *                   rfc:
 *                     type: string
 *                     description: RFC del usuario
 *                   fechaEmpiezo:
 *                     type: string
 *                     format: date
 *                     description: Fecha de inicio del usuario
 *                   locationId:
 *                     type: integer
 *                     description: ID de la ubicación del usuario
 *                   organizacion:
 *                     type: string
 *                     description: Organización (valor por defecto para compatibilidad)
 *                   diasOrdenProm:
 *                     type: number
 *                     nullable: true
 *                     description: Campo legacy (null en nueva estructura)
 *                   valorOrdenProm:
 *                     type: number
 *                     nullable: true
 *                     description: Campo legacy (null en nueva estructura)
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       500:
 *         description: Error del servidor
 */
router.get("/getUsers", getUsers);

/**
 * @swagger
 * /users/getSession:
 *   get:
 *     summary: Get current user session
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Session token retrieved
 *       401:
 *         description: Not authenticated
 */
router.get("/getSession", getSession);

/**
 * @swagger
 * /users/logoutUser:
 *   post:
 *     summary: Logout current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post("/logoutUser", logoutUser);

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Delete a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Email del usuario a eliminar
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing correo
 *       500:
 *         description: Server error
 */
router.delete("/deleteUser", deleteUser);

/**
 * @swagger
 * /users/updateUser:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Email del usuario (identificador)
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               rol:
 *                 type: string
 *                 description: Nombre del rol del usuario
 *               contrasena:
 *                 type: string
 *                 description: Nueva contraseña (opcional)
 *               rfc:
 *                 type: string
 *                 description: RFC del usuario
 *               location_id:
 *                 type: integer
 *                 description: ID de la ubicación del usuario
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
router.put("/updateUser", updateUser);

/**
 * @swagger
 * /users/{correo}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 correo:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 username:
 *                   type: string
 *                 rol:
 *                   type: string
 *                 rfc:
 *                   type: string
 *                 fechaEmpiezo:
 *                   type: string
 *                   format: date
 *                 locationId:
 *                   type: integer
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get("/:correo", getUserByEmail);

router.get("/getSession", getSession);

module.exports = router;