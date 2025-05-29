const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getSession = async (req, res) => {
  const token = req.cookies.token || req.cookies.Auth;
  
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      token: token,
      usuario: {
        id: decoded.id || decoded.USUARIO_ID,
        nombre: decoded.nombre || decoded.NOMBRE,
        rol: decoded.rol || decoded.ROL,
        correo: decoded.correo || decoded.CORREO,
        username: decoded.username || decoded.USERNAME
      }
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const registerUser = async (req, res) => {
  const { correo, nombre, contrasena, rol, username, rfc, location_id } = req.body;

  if (!correo || !nombre || !contrasena) {
    return res.status(400).json({ error: "Todos los campos obligatorios" });
  }

  try {
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    let rolId = null;

    if (rol) {
      // Usar Promise para esperar el resultado de exec
      rolId = await new Promise((resolve, reject) => {
        const rolQuery = "SELECT Rol_ID FROM Rol2 WHERE Nombre = ?";
        connection.exec(rolQuery, [rol], (err, rolResult) => {
          if (err) {
            return reject(err);
          }
          if (rolResult && rolResult.length > 0) {
            return resolve(rolResult[0].ROL_ID);
          }
          return resolve(null); // si no encontró el rol
        });
      });
    }

    const query = `
      INSERT INTO Usuario2 
      (Nombre, Rol_ID, Clave, Location_ID, FechaEmpiezo, RFC, Correo, Username)
      VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?, ?)
    `;

    const params = [
      nombre,
      rolId, // puede ser null
      contrasenaHash,
      location_id || null,
      rfc || null,
      correo,
      username || null,
    ];

    connection.exec(query, params, (err) => {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      res.status(201).json({ message: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


const loginUser = (req, res) => {
  const { correo, contrasena } = req.body;
  
  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo/Usuario y contraseña son requeridos" });
  }
  
  const query = `SELECT u.*, r.Nombre as RolNombre FROM Usuario2 u 
                LEFT JOIN Rol2 r ON u.Rol_ID = r.Rol_ID 
                WHERE u.Correo = ? OR u.Username = ?`;
  
  connection.exec(query, [correo, correo], async (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error del servidor" });
    }
    
    console.log("Query result:", rows); 
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];
    console.log("Usuario encontrado:", usuario); 
    
    try {
      const passwordCorrecta = await bcrypt.compare(contrasena, usuario.CLAVE);
      if (!passwordCorrecta) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      const payload = {
        id: usuario.USUARIO_ID,
        nombre: usuario.NOMBRE,
        rol: usuario.ROLNOMBRE || usuario.ROL_ID, 
        correo: usuario.CORREO,
        username: usuario.USERNAME,
        USUARIO_ID: usuario.USUARIO_ID, 
        ROL: usuario.ROLNOMBRE 
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.cookie("Auth", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ 
        message: "Login exitoso", 
        token, 
        usuario: payload 
      });
    } catch (error) {
      console.error("Error comparing password:", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
  });
};

const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT
        u.Usuario_ID,
        u.Nombre,
        u.Correo,
        u.Username,
        u.RFC,
        u.FechaEmpiezo,
        u.Location_ID,
        r.Nombre as RolNombre
      FROM Usuario2 u
      LEFT JOIN Rol2 r ON u.Rol_ID = r.Rol_ID
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener los usuarios:", err);
        return res.status(500).json({ error: "Error al obtener los usuarios" });
      }

      const formatted = result.map(usuario => ({
        id: usuario.USUARIO_ID,
        correo: usuario.CORREO,
        nombre: usuario.NOMBRE,
        username: usuario.USERNAME,
        rol: usuario.ROLNombre ,
        rfc: usuario.RFC,
        fechaEmpiezo: usuario.FECHAEMPIEZO,
        locationId: usuario.LOCATION_ID,
        diasOrdenProm: null,
        valorOrdenProm: null
      }));
      
      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deleteUser = async (req, res) => {
  const { correo } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: "Necesitas un email" });
  }
  
  try {
    const query = "DELETE FROM Usuario2 WHERE Correo = ?";
    connection.exec(query, [correo], (err, result) => {
      if (err) {
        console.error("Error eliminando usuario:", err);
        return res.status(500).json({ error: "Error servidor" });
      }
      res.status(200).json({ message: "Borrado exito" });
    });
  } catch (error) {
    console.error("Error borrando usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const updateUser = async (req, res) => {
  const { correo, nombre, rol, contrasena, username, rfc, location_id } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  try {
    if (rol) {
      const rolQuery = "SELECT Rol_ID FROM Rol2 WHERE Nombre = ?";
      connection.exec(rolQuery, [rol], async (err, rolResult) => {
        if (err) {
          console.error("Error getting role:", err);
          return res.status(500).json({ error: "Error servidor" });
        }
        
        let rolId = null;
        if (rolResult && rolResult.length > 0) {
          rolId = rolResult[0].ROL_ID;
        }
        
        await updateUserRecord(correo, nombre, rolId, contrasena, username, rfc, location_id, res);
      });
    } else {
      await updateUserRecord(correo, nombre, null, contrasena, username, rfc, location_id, res);
    }
  } catch (error) {
    console.error("Error actualizando:", error);
    res.status(500).json({ error: "Error servidor" });
  }
};

const updateUserRecord = async (correo, nombre, rolId, contrasena, username, rfc, location_id, res) => {
  try {
    let query = `UPDATE Usuario2 SET Nombre = ?, Username = ?, RFC = ?, Location_ID = ?`;
    let params = [nombre, username, rfc, location_id];
    
    if (rolId !== null) {
      query += `, Rol_ID = ?`;
      params.push(rolId);
    }
    
    if (contrasena) {
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      query += `, Clave = ?`;
      params.push(contrasenaHash);
    }
    
    query += ` WHERE Correo = ?`;
    params.push(correo);
    
    connection.exec(query, params, (err, result) => {
      if (err) {
        console.error("Error actualizando:", err);
        return res.status(500).json({ error: "Error servidor" });
      }
      res.status(200).json({ message: "Se actualizo bien" });
    });
  } catch (error) {
    console.error("Error actualizando:", error);
    res.status(500).json({ error: "Error servidor" });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", { path: "/", httpOnly: true, secure: false, sameSite: "Lax" });
  res.clearCookie("Auth", { path: "/", httpOnly: true, secure: false, sameSite: "Lax" });
  res.status(200).json({ message: "Sesión cerrada" });
};

const getUserByEmail = async (req, res) => {
  const { correo } = req.params;
  
  try {
    const query = `
      SELECT 
        u.Usuario_ID,
        u.Nombre,
        u.Correo,
        u.Username,
        u.RFC,
        u.FechaEmpiezo,
        u.Location_ID,
        r.Nombre as RolNombre
      FROM Usuario2 u
      LEFT JOIN Rol2 r ON u.Rol_ID = r.Rol_ID
      WHERE u.Correo = ?
    `;
    
    connection.exec(query, [correo], (err, result) => {
      if (err) {
        console.error("Error al obtener usuario:", err);
        return res.status(500).json({ error: "Error del servidor" });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      const usuario = {
        id: result[0].USUARIO_ID,
        correo: result[0].CORREO,
        nombre: result[0].NOMBRE,
        username: result[0].USERNAME,
        organizacion: 'DEFAULT',
        rol: result[0].ROLNombre || 'USER',
        rfc: result[0].RFC,
        fechaEmpiezo: result[0].FECHAEMPIEZO,
        locationId: result[0].LOCATION_ID,
        diasOrdenProm: null,
        valorOrdenProm: null
      };
      
      res.status(200).json(usuario);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUsers, 
  getSession, 
  logoutUser, 
  deleteUser, 
  updateUser, 
  getUserByEmail 
};