const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { correo, nombre, organizacion, contrasena, rol, diasordenprom, valorordenprom } = req.body;

  if (!correo || !nombre || !contrasena) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const query = `
      INSERT INTO DBADMIN.Usuarios 
      (Correo, Nombre, Organizacion, contrasena, Rol, DiasOrdenProm, ValorOrdenProm)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [correo, nombre, organizacion, contrasenaHash, rol, diasordenprom, valorordenprom];

    connection.exec(query, params, (err) => {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const query = "SELECT correo, nombre, organizacion, contrasena, rol FROM DBADMIN.Usuarios WHERE correo = ?";
    const params = [correo];

    connection.exec(query, params, async (err, result) => {
      if (err) {
        console.error("Query Error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Email or password incorrect" });
      }      

      const user = result[0];
      const contrasenaMatch = await bcrypt.compare(contrasena, user.CONTRASENA);
      
      if (!contrasenaMatch) {
        return res.status(401).json({ error: "Email or password incorrect" });
      }
      
      // Generate JWT
      const token = jwt.sign(
        {
          CORREO: user.CORREO,
          ROL: user.ROL,
          ORGANIZACION: user.ORGANIZACION
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      // Secure auth token in HttpOnly cookie
      res.cookie("Auth", token, {
        httpOnly: true,
        secure: false, // Set to true in production (HTTPS required)
        sameSite: "Lax",
        maxAge: 3600000 // 1 hour
      });
      
      res.cookie("UserData", JSON.stringify({
        CORREO: user.CORREO,
        ROL: user.ROL,
        ORGANIZACION: user.ORGANIZACION,
        NOMBRE: user.NOMBRE // added for clarity
      }), {
        httpOnly: false,
        secure: false, // true in prod
        sameSite: "Lax",
        maxAge: 3600000
      });
      

      //console.log("Logged in")
      return res.json({ message: "Login successful" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT
        CORREO,
        NOMBRE,
        ORGANIZACION,
        CONTRASENA,
        ROL,
        DIASORDENPROM,
        VALORORDENPROM
      FROM DBADMIN.Usuarios
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener los usuarios:", err);
        return res.status(500).json({ error: "Error al obtener los usuarios" });
      }

      // Verifica si el resultado es un array
      if (!Array.isArray(result)) {
        return res.status(500).json({ error: "El formato de los datos es incorrecto" });
      }

      // Mapea el resultado en el formato deseado
      const formatted = result.map(usuario => ({
        id: usuario.CORREO,  // Si el correo es único, lo puedes usar como ID
        correo: usuario.CORREO,
        nombre: usuario.NOMBRE,
        organizacion: usuario.ORGANIZACION,
        rol: usuario.ROL,
        diasOrdenProm: usuario.DIASORDENPROM,
        valorOrdenProm: usuario.VALORORDENPROM
      }));
      
      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


//Agregado para usurios / admin
const deleteUser = async (req, res) => {
  const { correo } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: "Necesitas un email" });
  }
  
  try {
    const query = "DELETE FROM DBADMIN.Usuarios WHERE Correo = ?";
    connection.exec(query, [correo], (err, result) => {
      if (err) {
        console.error("Error eliminando usario:", err);
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
  const { correo, nombre, organizacion, rol, contrasena, imagen } = req.body;
  
  if (!correo) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  try {
    let query = `
      UPDATE DBADMIN.Usuarios 
      SET Nombre = ?, Organizacion = ?, Rol = ?
    `;
    let params = [nombre, organizacion, rol];
    
    // Si se proporciona contraseña, hash y actualiza
    if (contrasena) {
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      query += `, Contrasena = ?`;
      params.push(contrasenaHash);
    }
    
    // Si se proporciona imagen
    if (imagen) {
      query += `, Imagen = ?`;
      params.push(imagen);
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

const getSession = async (req, res) => {
  const token = req.cookies.Auth;  // Read the cookie
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  return res.json({ token });
}

const logoutUser = async (req, res) => {
  res.clearCookie("Auth", { path: "/", httpOnly: true, secure: false, sameSite: "Lax" });
  res.status(200).json({ message: "Sesión cerrada" });
};


const getUserByEmail = async (req, res) => {
  const { correo } = req.params;
  
  try {
    const query = "SELECT * FROM DBADMIN.Usuarios WHERE correo = ?";
    connection.exec(query, [correo], (err, result) => {
      if (err) {
        console.error("Error al obtener usuario:", err);
        return res.status(500).json({ error: "Error del servidor" });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      // Formatea el resultado
      const usuario = {
        correo: result[0].CORREO,
        nombre: result[0].NOMBRE,
        organizacion: result[0].ORGANIZACION,
        rol: result[0].ROL,
        diasOrdenProm: result[0].DIASORDENPROM,
        valorOrdenProm: result[0].VALORORDENPROM
      };
      
      res.status(200).json(usuario);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


module.exports = { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser,getUserByEmail };