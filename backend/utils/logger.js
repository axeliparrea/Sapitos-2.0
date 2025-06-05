/**
 * Logger module for the application
 * 
 * Provides consistent logging across the application with timestamp and log level.
 * Formats console output for better readability, while maintaining detailed logs in files.
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

// Setup colors theme
colors.setTheme({
    info: 'green',
    warn: 'yellow',
    error: 'red',
    debug: 'cyan',
    data: 'grey',
    help: 'magenta',
    server: 'blue',
    db: 'blue',
    ml: 'magenta'
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Current date for log file name
const currentDate = new Date();
const logFileName = `app_${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}.log`;
const logFilePath = path.join(logsDir, logFileName);

/**
 * Log a message to console and log file
 * @param {string} level - Log level (INFO, ERROR, etc.)
 * @param {string} message - Message to log
 */
function log(level, message) {
    // Always create detailed logs for file storage
    const timestamp = new Date().toISOString();
    const fileLogMessage = `${timestamp} - ${level} - ${message}\n`;
    
    // Log to file (full details)
    fs.appendFile(logFilePath, fileLogMessage, (err) => {
        if (err) {
            console.error(`${colors.red}[ERROR]${colors.reset} Failed to write to log file`);
        }
    });
      // Format console output (simplified and colored)
    let prefix = '';
    let formattedMessage = message;
    
    // Filter out certain messages from console
    if (level === 'INFO') {
        // Skip logging certain verbose INFO messages to console
        if (message.includes('scheduler') && !message.includes('initialized') && 
            !message.includes('Running scheduled') && !message.includes('completed successfully')) {
            return; // Don't show these messages in console
        }
        
        // Clean up and format specific message types
        if (message.includes('Server running')) {
            formattedMessage = colors.bold(message);
        } else if (message.includes('API documentation')) {
            formattedMessage = colors.bold(message);
        } else if (message.includes('Database')) {
            formattedMessage = colors.db(message);
        } else if (message.includes('ML')) {
            formattedMessage = colors.ml(message);
        }
        prefix = colors.green('✓ ');
    } else if (level === 'ERROR') {
        prefix = colors.error('✗ ');
        formattedMessage = colors.error(message);
    } else if (level === 'WARNING') {
        prefix = colors.warn('⚠ ');
        formattedMessage = colors.warn(message);
    } else if (level === 'DEBUG') {
        // Skip debug messages in production
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        prefix = colors.debug('➤ ');
        formattedMessage = colors.debug(message);
    } else {
        prefix = `[${level}]`;
    }
    
    // Log to console (simplified)
    console.log(`${prefix}${formattedMessage}`);
}

module.exports = {
    /**
     * Log an info message
     * @param {string} message - Message to log
     */
    info: (message) => log('INFO', message),
    
    /**
     * Log an error message
     * @param {string} message - Message to log
     */
    error: (message) => log('ERROR', message),
    
    /**
     * Log a warning message
     * @param {string} message - Message to log
     */
    warning: (message) => log('WARNING', message),
    
    /**
     * Log a debug message
     * @param {string} message - Message to log
     */
    debug: (message) => log('DEBUG', message)
};
