const jwt = require("jsonwebtoken");

// Middleware para autenticar usando el token JWT en cookies
const auth = (roles = []) => (req, res, next) => {
  const token = req.cookies.token; // <-- Asegúrate de usar el mismo nombre que usaste en el login (token)

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (roles.length && !roles.includes(req.user.rol)) {
      console.log("Rol =", req.user.rol, ", acceso denegado");
      return res.status(403).json({ message: "Acceso prohibido" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = { auth };
