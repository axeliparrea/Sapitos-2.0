const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT from cookies and get user info
const auth = (roles = [], requireOtp = false) => (req, res, next) => {
  const token = req.cookies.Auth;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded); // Log the decoded JWT
      req.user = decoded; // Attach user to request
      
      // Check if OTP verification is required
      const otpEnabled = process.env.AUTH_OTP === 'true';
      
      if (otpEnabled && requireOtp) {
          // Check if user has verified OTP
          if (!decoded.otpVerified) {
              console.log("User has not verified OTP");
              return res.status(401).json({ 
                  requiresOtp: true,
                  message: "OTP verification required" 
              });
          }
      }
      
      // Cambiar a req.user.rol (minúsculas)
      if (roles.length && !roles.includes(req.user.rol)) {
          console.log("Rol =", req.user.rol, ", forbidden")
          return res.status(403).json({ message: "Forbidden" });
      }
      next();
  } catch (error) {
      console.error('JWT verification error:', error); // Log verification errors
      return res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = { auth };

