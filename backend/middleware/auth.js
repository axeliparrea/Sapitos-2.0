const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT from cookies and get user info
const auth = (roles = []) => (req, res, next) => {
  const token = req.cookies.SessionData;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user to request
      if (roles.length && !roles.includes(req.user.ROL)) {
            console.log("Rol =",req.user.ROL,", forbidden")
          return res.status(403).json({ message: "Forbidden" });
      }
      next();
  } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = { auth };
