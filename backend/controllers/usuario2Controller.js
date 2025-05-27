const { connection } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Obtener todos los usuarios
const getUsuarios = (req, res) => {
  connection.exec("SELECT * FROM Usuario2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
  const { Nombre, Rol_ID, Clave, Location_ID, FechaEmpiezo, RFC, Correo, Username } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Clave, 10);
    const query = `
      INSERT INTO Usuario2 
      (Nombre, Rol_ID, Clave, Location_ID, FechaEmpiezo, RFC, Correo, Username) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.prepare(query, (err, statement) => {
      if (err) return res.status(500).json({ error: err.message });
      statement.exec(
        [Nombre, Rol_ID, hashedPassword, Location_ID, FechaEmpiezo, RFC, Correo, Username],
        (execErr) => {
          if (execErr) return res.status(500).json({ error: execErr.message });
          res.status(201).json({ message: "Usuario creado correctamente" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: "Error al hashear la contraseña" });
  }
};

// Actualizar un usuario existente
const updateUsuario = (req, res) => {
  const { Usuario_ID, Nombre, Rol_ID, Location_ID, FechaEmpiezo, RFC, Correo, Username } = req.body;

  const query = `
    UPDATE Usuario2 SET
      Nombre = ?, Rol_ID = ?, Location_ID = ?, FechaEmpiezo = ?, RFC = ?, Correo = ?, Username = ?
    WHERE Usuario_ID = ?`;

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });

    statement.exec(
      [Nombre, Rol_ID, Location_ID, FechaEmpiezo, RFC, Correo, Username, Usuario_ID],
      (execErr) => {
        if (execErr) return res.status(500).json({ error: execErr.message });
        res.json({ message: "Usuario actualizado correctamente" });
      }
    );
  });
};

// Eliminar un usuario
const deleteUsuario = (req, res) => {
  const { Usuario_ID } = req.body;

  const query = `DELETE FROM Usuario2 WHERE Usuario_ID = ?`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });

    statement.exec([Usuario_ID], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Usuario eliminado correctamente" });
    });
  });
};

// Login de usuario
const loginUsuario = (req, res) => {
  const { correoOUsuario, Clave } = req.body;
  const query = `SELECT * FROM Usuario2 WHERE Correo = ? OR Username = ?`;

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });

    statement.exec([correoOUsuario, correoOUsuario], async (execErr, rows) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      if (!rows || rows.length === 0)
        return res.status(404).json({ error: "Usuario no encontrado" });

      const usuario = rows[0];
      const passwordCorrecta = await bcrypt.compare(Clave, usuario.CLAVE);
      if (!passwordCorrecta)
        return res.status(401).json({ error: "Contraseña incorrecta" });

      const payload = {
        id: usuario.USUARIO_ID,
        nombre: usuario.NOMBRE,
        rol: usuario.ROL_ID,
        correo: usuario.CORREO,
        username: usuario.USERNAME,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // cambia a true en producción con HTTPS
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });

      res.json({ message: "Login exitoso", token, usuario: payload });
    });
  });
};

// Obtener sesión del usuario
const getSessionUsuario = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ usuario: decoded, token });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Sesión expirada" });
    }
    res.status(401).json({ error: "Token inválido" });
  }
};


const logoutUsuario = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // true si usas HTTPS en producción
    sameSite: "Lax",
  });
  res.json({ message: "Sesión cerrada exitosamente" });
};



module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  getSessionUsuario,
  logoutUsuario,
};

