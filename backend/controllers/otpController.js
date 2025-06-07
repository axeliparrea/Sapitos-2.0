const { generateOTP, verifyOTP } = require('../utils/otp');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');
const { getUserById } = require('../controllers/userController');

/**
 * Middleware to check if auth timestamp is older than 24 hours
 * and redirect to OTP verification if needed
 */
const checkAuthTimestamp = (req, res, next) => {
    console.log('Running checkAuthTimestamp middleware');
    
    // Check if OTP is enabled in environment
    const otpEnabled = process.env.AUTH_OTP === 'true';
    console.log(`OTP enabled in environment: ${otpEnabled}`);
    
    if (!otpEnabled) {
        console.log('OTP is disabled, skipping verification');
        return next();
    }
    
    try {
        // Check if user exists in request (should be added by auth middleware)
        if (!req.user) {
            console.log('No user in request, authentication middleware may not be executed first');
            return res.status(401).json({ 
                requiresAuth: true,
                message: 'Authentication required' 
            });
        }
        
        // Check if authTimestamp exists in JWT payload
        const authTimestamp = req.user.authTimestamp;
        console.log(`Auth timestamp from JWT: ${authTimestamp}`);
        
        if (!authTimestamp) {
            console.log('No authTimestamp in token, token might be old or malformed');
            return res.status(401).json({ 
                requiresOtp: true,
                message: 'Session requires OTP verification (no timestamp)'
            });
        }
        
        // Check if timestamp is older than 24 hours
        const now = Date.now();
        const timeDiff = now - authTimestamp;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        console.log(`Token age: ${hoursDiff.toFixed(2)} hours`);
        
        if (hoursDiff > 24) {
            console.log('Auth timestamp is older than 24 hours, requiring OTP verification');
            return res.status(401).json({ 
                requiresOtp: true,
                message: 'Session requires OTP verification'
            });
        }
        
        console.log('Auth timestamp is recent, proceeding without OTP');
        next();
    } catch (error) {
        console.error('Error in checkAuthTimestamp middleware:', error);
        res.status(500).json({ message: 'Server error during OTP check' });
    }
};

/**
 * Generate OTP for user verification
 */
const generateOTPHandler = async (req, res) => {
    try {
        console.log("OTP Handler - Checking environment variables:");
        console.log(`AUTH_OTP set to: ${process.env.AUTH_OTP}`);
        console.log(`OTP enabled: ${process.env.AUTH_OTP === 'true'}`);
        
        // Get user info from JWT token
        const token = req.cookies.Auth;
        if (!token) {
            console.log("No Auth cookie found");
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const decoded = jwt.decode(token);
        if (!decoded) {
            console.log("Invalid token format");
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        console.log("Token decoded successfully:", { 
            userId: decoded.id,
            email: decoded.correo,
            hasAuthTimestamp: !!decoded.authTimestamp 
        });
        
        // Generate OTP
        const { otp, secret } = generateOTP();
        
        try {
            // Get user information to include in email
            let userName = "User";
            
            if (decoded.id) {
                try {
                    const user = await getUserById(decoded.id);
                    if (user && user.NOMBRE) {
                        userName = user.NOMBRE;
                    }
                } catch (userError) {
                    console.error("Failed to fetch user details:", userError);
                }
            }
            
            // Send OTP via email
            const userEmail = decoded.correo;
            console.log(`Sending OTP to email: ${userEmail} for user: ${userName}`);
            
            const emailSent = await sendOTPEmail(userEmail, otp, userName);
            
            if (!emailSent) {
                console.error("Failed to send OTP email");
                return res.status(500).json({ 
                    success: false,
                    message: 'Failed to send verification code. Please try again.'
                });
            }
            
            console.log(`OTP email sent successfully to ${userEmail}`);
            
            // Only send the secret to the client, never the OTP
            res.json({
                success: true, 
                message: 'Verification code sent to your email',
                secret,
                authOtpEnabled: process.env.AUTH_OTP === 'true'
            });
            
        } catch (error) {
            console.error("Error in OTP generation process:", error);
            res.status(500).json({ 
                success: false,
                message: 'Server error during OTP generation'
            });
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Failed to generate OTP' });
    }
};

/**
 * Verify OTP provided by user
 */
const verifyOTPHandler = async (req, res) => {    try {
        console.log("Verifying OTP...");
        const { otp, secret } = req.body;
        
        if (!otp || !secret) {
            return res.status(400).json({ 
                message: 'OTP and secret are required' 
            });
        }
        
        // Verify the OTP
        const isValid = verifyOTP(otp, secret);
        console.log("OTP verification result:", isValid);
        
        if (isValid) {
            // Get user info from token
            const token = req.cookies.Auth;
            const decoded = jwt.decode(token);
            
            if (!decoded) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            const { exp, ...decodedWithoutExp } = decoded;
            
            const payload = {
                ...decodedWithoutExp,
                authTimestamp: Date.now() // Update timestamp
            };
            
            const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            });
            res.cookie("Auth", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                path: "/",
            });
            
            res.json({ 
                verified: true, 
                message: 'OTP verified successfully',
                token: newToken 
            });
        } else {
            res.status(400).json({ 
                verified: false, 
                message: 'Invalid OTP' 
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

module.exports = {
    checkAuthTimestamp,
    generateOTPHandler,
    verifyOTPHandler
};
