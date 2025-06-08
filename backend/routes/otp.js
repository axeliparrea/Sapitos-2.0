const express = require('express');
const router = express.Router();
const { generateOTPHandler, verifyOTPHandler } = require('../controllers/otpController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/otp/generate:
 *   get:
 *     summary: Generate an OTP for verification
 *     tags: [OTP]
 *     responses:
 *       200:
 *         description: OTP generated successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/generate', generateOTPHandler);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify an OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - secret
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP code to verify
 *               secret:
 *                 type: string
 *                 description: The secret used to generate the OTP
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or missing parameters
 *       500:
 *         description: Server error
 */
router.post('/verify', verifyOTPHandler);

module.exports = router;
