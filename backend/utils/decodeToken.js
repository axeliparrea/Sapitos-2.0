const jwt = require('jsonwebtoken');

// Check if a token was provided as an argument
if (process.argv.length < 3) {
  console.log('Usage: node decodeToken.js <token>');
  process.exit(1);
}

// Get the token from command-line arguments
const token = process.argv[2];

try {
  // First try to decode without verification
  const decoded = jwt.decode(token);
  
  if (decoded) {
    console.log('Decoded JWT token:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // If there's an authTimestamp, show when it was created
    if (decoded.authTimestamp) {
      const date = new Date(decoded.authTimestamp);
      console.log(`\nAuth timestamp: ${date.toLocaleString()}`);
      
      // Calculate how old the token is
      const now = Date.now();
      const ageInHours = (now - decoded.authTimestamp) / (1000 * 60 * 60);
      console.log(`Token age: ${ageInHours.toFixed(2)} hours`);
      
      // Check if it's older than 24 hours
      if (ageInHours > 24) {
        console.log('Token is older than 24 hours - should trigger OTP verification');
      } else {
        console.log('Token is less than 24 hours old - should not trigger OTP verification');
      }
    } else {
      console.log('\nNo authTimestamp found in the token');
    }
    
    // Try to verify with JWT_SECRET from env if available
    if (process.env.JWT_SECRET) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        console.log('\nToken is valid and verified with JWT_SECRET');
      } catch (verifyError) {
        console.log('\nToken could not be verified with JWT_SECRET:', verifyError.message);
      }
    }
  } else {
    console.error('Failed to decode token. Invalid format.');
  }
} catch (error) {
  console.error('Error decoding token:', error.message);
}