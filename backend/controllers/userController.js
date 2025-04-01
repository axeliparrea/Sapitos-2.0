const { connection } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { correo, nombre, organizacion, contrasena, rol } = req.body;

  if (!correo || !nombre || !contrasena) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const query = "INSERT INTO DBADMIN.Usuarios (Correo, Nombre, Organizacion, Contrasena, Rol) VALUES (?, ?, ?, ?, ?)";
    const params = [correo, nombre, organizacion, contrasenaHash, rol];

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

      const user = result[0];
      const contrasenaMatch = await bcrypt.compare(contrasena, user.CONTRASENA);

      if (!contrasenaMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT with role
      const token = jwt.sign(
        { correo: user.CORREO, rol: user.ROL, organizacion: user.ORGANIZACION },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      

      // Store token in HTTP-only cookie
      res.cookie("SessionData", token, {
        httpOnly: true,  // Secure, prevents JS access (XSS protection)
        secure: true,    // Only send over HTTPS
        sameSite: "Strict",
        maxAge: 3600000, // 1 hour
      });

      return res.json({ message: "Login successful" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


const getUsers = async (req, res) => {
  try {
    const query = "SELECT correo, nombre, organizacion, contrasena, rol, fechacreacion FROM DBADMIN.Usuarios";

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUsers };
