const jwt = require('jsonwebtoken');
const { connection } = require('../config/db');

/**
 * Middleware para verificar si el usuario tiene el rol de superadmin (rol_id=5)
 * Esto permitirá distinguir entre admin regular (rol_id=1) y superadmin
 */
const isSuperAdmin = (req, res, next) => {
  // Verificar si el usuario está autenticado (el middleware auth debería haberse ejecutado antes)
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verificar si el usuario tiene el rol_id de superadmin
  const userId = req.user.id || req.user.USUARIO_ID;
  
  connection.exec(
    `SELECT r.Rol_ID FROM USUARIO2 u 
     JOIN ROL2 r ON u.Rol_ID = r.Rol_ID 
     WHERE u.USUARIO_ID = ?`, 
    [userId], 
    (err, results) => {
      if (err) {
        console.error("Error verificando rol:", err);
        return res.status(500).json({ message: "Error del servidor" });
      }
      
      if (!results || results.length === 0) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Obtener el valor del rol_id y convertirlo a número para comparación segura
      const rolId = Number(results[0].ROL_ID || results[0].Rol_ID);
      console.log(`Debug - Usuario ID: ${userId}, Rol obtenido: ${rolId}, Tipo: ${typeof rolId}`);
      
      // Solo permitir acceso al superadmin (rol_id = 5)
      if (rolId !== 5) {
        console.log(`Usuario ID ${userId} con rol ${rolId} intentó acceder a una ruta protegida para superadmin`);
        return res.status(403).json({ message: "Acceso restringido solo para superadmin" });
      }
      
      // El usuario es superadmin, permitir acceso
      next();
    }
  );
};

/**
 * Middleware para verificar si el usuario puede acceder a funciones de admin limitadas
 * Los admin regulares (rol_id=1) solo pueden acceder a dashboards, inventario, pedidos, alertas y chat de AI
 */
const isAdminOrSuperAdmin = (req, res, next) => {
  // Verificar si el usuario está autenticado
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verificar el rol del usuario
  const userId = req.user.id || req.user.USUARIO_ID;
  
  connection.exec(
    `SELECT r.Rol_ID FROM USUARIO2 u 
     JOIN ROL2 r ON u.Rol_ID = r.Rol_ID 
     WHERE u.USUARIO_ID = ?`, 
    [userId], 
    (err, results) => {
      if (err) {
        console.error("Error verificando rol:", err);
        return res.status(500).json({ message: "Error del servidor" });
      }
      
      if (!results || results.length === 0) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Obtener el valor del rol_id y convertirlo a número para comparación segura
      const rolId = Number(results[0].ROL_ID || results[0].Rol_ID);
      
      // Permitir acceso a admin (rol_id = 1) o superadmin (rol_id = 5)
      if (rolId !== 1 && rolId !== 5) {
        return res.status(403).json({ message: "Acceso restringido solo para administradores" });
      }
      
      // El usuario es admin o superadmin, permitir acceso
      next();
    }
  );
};

module.exports = { isSuperAdmin, isAdminOrSuperAdmin }; 