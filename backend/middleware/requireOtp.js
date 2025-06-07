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

  // Check if user has verified OTP
  if (!req.user.otpVerified) {
    console.log('User has not completed OTP verification, redirecting');
    return res.status(401).json({ 
      requiresOtp: true,
      message: 'OTP verification required'
    });
  }

  // User is authenticated and OTP verified
  next();
};

module.exports = { requireOtpVerification };
