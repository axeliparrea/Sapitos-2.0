const jwt = require('jsonwebtoken');
const { connection } = require('../config/db');

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
          // Get user ID for database check
          const userId = decoded.id || decoded.USUARIO_ID;
          
          // Check OTP verification status in database
          connection.exec(
              `SELECT OTP_VERIFIED, OTP_VERIFIED_AT FROM "DBADMIN"."USUARIO2" WHERE USUARIO_ID = ?`,
              [userId],
              (err, results) => {
                  if (err) {
                      console.error('Error checking OTP verification status:', err);
                      return res.status(500).json({ message: 'Server error during auth' });
                  }
                  
                  if (!results || results.length === 0) {
                      console.log('User not found in database');
                      return res.status(401).json({ message: "Unauthorized" });
                  }
                  
                  const user = results[0];
                  
                  // If user has not verified OTP yet
                  if (!user.OTP_VERIFIED) {
                      console.log("User has not verified OTP");
                      return res.status(401).json({ 
                          requiresOtp: true,
                          message: "OTP verification required" 
                      });
                  }
                  
                  // Check if OTP verification is older than 24 hours
                  const now = new Date();
                  const verifiedAt = new Date(user.OTP_VERIFIED_AT);
                  const hoursDiff = (now - verifiedAt) / (1000 * 60 * 60);
                  
                  if (hoursDiff > 24) {
                      console.log("OTP verification expired (older than 24 hours)");
                      return res.status(401).json({ 
                          requiresOtp: true,
                          message: "OTP verification expired" 
                      });
                  }
                  
                  // OTP verification is valid, continue with role check
                  checkRole();
              }
          );
      } else {
          // OTP not required, continue with role check
          checkRole();
      }
      
      function checkRole() {
          // Check role authorization
          if (roles.length && !roles.includes(req.user.rol)) {
              console.log("Rol =", req.user.rol, ", forbidden")
              return res.status(403).json({ message: "Forbidden" });
          }
          next();
      }
  } catch (error) {
      console.error('JWT verification error:', error); // Log verification errors
      return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { auth };
