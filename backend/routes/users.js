const express = require("express");
const { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser } = require("../controllers/userController");
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
 *               nombre:
 *                 type: string
 *               organizacion:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               rol:
 *                 type: string
 *               diasordenprom:
 *                 type: number
 *               valorordenprom:
 *                 type: number
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
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

router.post("/login", loginUser);

/**
 * @swagger
 * /users/getUsers:
 *   get:
 *     summary: Obtiene todos los usuarios registrados en el sistema
 *     description: Retorna una lista completa de usuarios con sus datos básicos y estadísticas
 *     tags: [Usuarios]
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
 *                   correo:
 *                     type: string
 *                     description: Correo electrónico del usuario (identificador único)
 *                   nombre:
 *                     type: string
 *                     description: Nombre completo del usuario
 *                   organizacion:
 *                     type: string
 *                     description: Organización a la que pertenece el usuario
 *                   contrasenia:
 *                     type: string
 *                     description: Contraseña encriptada del usuario
 *                   rol:
 *                     type: string
 *                     description: Rol del usuario (admin, dueno, etc.)
 *                   diasOrdenProm:
 *                     type: number
 *                     description: Promedio de días entre órdenes del usuario
 *                   valorOrdenProm:
 *                     type: number
 *                     description: Valor promedio de las órdenes del usuario
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 *       500:
 *         description: Error del servidor
 */

// router.get("/getUsers", auth(["admin", "dueno"]), getUsers);
router.get("/getUsers", getUsers);


router.get("/getSession", getSession)

router.post("/logoutUser", logoutUser)

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
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing correo
 *       500:
 *         description: Server error
 */
// router.delete("/deleteUser", auth(["admin"]), deleteUser);
router.delete("/deleteUser",deleteUser);


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
 *               nombre:
 *                 type: string
 *               organizacion:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
// router.put("/updateUser", auth(["admin"]), updateUser);
router.put("/updateUser", updateUser);


module.exports = router;
