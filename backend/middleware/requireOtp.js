const { connection } = require('../config/db');

/**
 * Middleware to require OTP verification for protected routes
 * This provides a centralized way to enforce OTP verification
 */
const requireOtpVerification = (req, res, next) => {
  // Skip OTP check if it's disabled in environment
  if (process.env.AUTH_OTP !== 'true') {
    return next();
  }

  // Check if user exists in request (added by auth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      requiresAuth: true,
      message: 'Authentication required' 
    });
  }

  // Get user ID for database check
  const userId = req.user.id || req.user.USUARIO_ID;
  
  // Check OTP verification status in database
  connection.exec(
    `SELECT OTP_VERIFIED, OTP_VERIFIED_AT FROM "DBADMIN"."USUARIO2" WHERE USUARIO_ID = ?`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error checking OTP verification status:', err);
        return res.status(500).json({ message: 'Server error during OTP check' });
      }
      
      if (!results || results.length === 0) {
        console.log('User not found in database');
        return res.status(401).json({ 
          requiresAuth: true,
          message: 'Authentication required' 
        });
      }
      
      const user = results[0];
      
      // If user has not verified OTP yet
      if (!user.OTP_VERIFIED) {
        console.log('User has not completed OTP verification, redirecting');
        return res.status(401).json({ 
          requiresOtp: true,
          message: 'OTP verification required'
        });
      }
      
      // Check if OTP verification is older than 24 hours
      const now = new Date();
      const verifiedAt = new Date(user.OTP_VERIFIED_AT);
      const hoursDiff = (now - verifiedAt) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('OTP verification is older than 24 hours, requiring new verification');
        return res.status(401).json({ 
          requiresOtp: true,
          message: 'OTP verification expired' 
        });
      }
      
      // User is authenticated and OTP verified
      next();
    }
  );
};

module.exports = { requireOtpVerification };