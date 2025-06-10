const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/settings/otp:
 *   get:
 *     summary: Get OTP settings from environment variables
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: OTP settings retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/otp', (req, res) => {
  try {
    // Get the AUTH_OTP setting from environment variables
    const requireOtp = process.env.AUTH_OTP === 'true';
    
    res.json({
      requireOtp,
      message: `OTP verification is ${requireOtp ? 'required' : 'optional'}`
    });
  } catch (error) {
    console.error('Error getting OTP settings:', error);
    res.status(500).json({ error: 'Server error fetching OTP settings' });
  }
});

module.exports = router;
