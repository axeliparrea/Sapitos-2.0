const speakeasy = require('speakeasy');

/**
 * Generate an OTP and its secret
 * @returns {Object} - Contains the OTP and secret
 */
const generateOTP = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        step: 200, // OTP valid for 200 seconds
    });
    return { otp, secret: secret.base32 };
};

/**
 * Verify an OTP
 * @param {string} otp - The OTP to verify
 * @param {string} secret - The secret used to generate the OTP
 * @returns {boolean} - True if the OTP is valid, false otherwise
 */
const verifyOTP = (otp, secret) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: otp,
        step: 200, // Must match the step used in generation
    });
};

module.exports = { generateOTP, verifyOTP };
