/**
 * Stock Prediction Scheduler for web application
 * 
 * This module provides functionality to schedule and run the weekly stock prediction
 * pipeline as part of the web application. It's designed to be initialized when
 * the server starts and run the stock minimum update process weekly.
 */

const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'mlops', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Load configuration
try {
    // Try to import configuration from Python file using a JSON interpretation
    const configPath = path.join(__dirname, '..', '..', 'mlops', 'config', 'stock_update_config.py');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Parse the Python config file to extract schedule parameters
    const dayMatch = configContent.match(/SCHEDULE_DAY\s*=\s*(\d+)/);
    const hourMatch = configContent.match(/SCHEDULE_HOUR\s*=\s*(\d+)/);
    const minuteMatch = configContent.match(/SCHEDULE_MINUTE\s*=\s*(\d+)/);
    
    var scheduleDay = dayMatch ? parseInt(dayMatch[1]) : 0; // Default to Monday (0)
    var scheduleHour = hourMatch ? parseInt(hourMatch[1]) : 1; // Default to 1 AM
    var scheduleMinute = minuteMatch ? parseInt(minuteMatch[1]) : 0; // Default to 0 minutes
    
    // Using debug level to keep it out of regular console output
    logger.debug(`ML scheduler config loaded: Day=${scheduleDay}, Hour=${scheduleHour}, Min=${scheduleMinute}`);
    } catch (error) {
        logger.error(`ML config error: ${error}. Using defaults.`);
        var scheduleDay = 0; // Default to Monday
        var scheduleHour = 1; // Default to 1 AM
        var scheduleMinute = 0; // Default to 0 minutes
    }

/**
 * Convert day number to cron day-of-week format
 * Python: 0=Monday, 1=Tuesday, ..., 6=Sunday
 * Cron: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function convertDayToCron(pythonDay) {
    // Convert Python day (0=Monday) to Cron day (0=Sunday)
    return (pythonDay + 1) % 7;
}

/**
 * Run the stock update pipeline script
 */
function runStockUpdatePipeline() {
    logger.debug('Starting ML stock prediction pipeline');
    
    try {
        const scriptPath = path.join(__dirname, '..', '..', 'mlops', 'pipelines', 'weekly_stock_update.py');
        
        if (!fs.existsSync(scriptPath)) {
            logger.error(`ML: Pipeline script not found`);
            return;
        }
        
        logger.debug(`ML: Executing pipeline script`);
        
        // Try different Python commands (python3, python, py) to improve compatibility
        const pythonCommands = ['python3', 'python', 'py'];
        let pythonProcess = null;
        let commandUsed = '';
        
        for (const cmd of pythonCommands) {
            try {
                // Try to spawn the process with the current command
                pythonProcess = spawn(cmd, [scriptPath], { shell: true });
                commandUsed = cmd;
                break;
            } catch (err) {
                logger.warning(`Failed to spawn Python process with command '${cmd}': ${err.message}`);
            }
        }
        
        if (!pythonProcess) {
            logger.error('Failed to spawn Python process with any command');
            return;
        }
        
        logger.info(`Python process started using command: ${commandUsed}`);
          pythonProcess.stdout.on('data', (data) => {
            // Only log essential ML output to console
            const output = data.toString().trim();
            if (output.includes('ERROR') || output.includes('WARNING') || 
                output.includes('completed') || output.includes('success')) {
                logger.info(`ML: ${output.substring(0, 120)}${output.length > 120 ? '...' : ''}`);
            } else {
                // Still log everything to file using debug level (won't show in console)
                logger.debug(`ML output: ${output}`);
            }
        });
        
        pythonProcess.stderr.on('data', (data) => {
            logger.error(`ML error: ${data.toString().trim().substring(0, 150)}`);
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                logger.info(`Stock update pipeline completed successfully`);
            } else {
                logger.error(`Stock update pipeline failed with code ${code}`);
            }
        });
        
        pythonProcess.on('error', (err) => {
            logger.error(`Error executing Python process: ${err}`);
        });
    } catch (error) {
        logger.error(`Failed to run stock update pipeline: ${error}`);
    }
}

/**
 * Initialize the stock update scheduler
 */
function initializeScheduler() {
    try {
        // Convert Python day format (0=Monday) to cron format (0=Sunday)
        const cronDay = convertDayToCron(scheduleDay);
        
        // Create cron schedule (minute hour * * dayOfWeek)
        const schedule = `${scheduleMinute} ${scheduleHour} * * ${cronDay}`;
        
    logger.debug(`ML scheduler set for: ${schedule} (cron format)`);
        
        // Schedule the task
        cron.schedule(schedule, () => {
            logger.info('ML: Running scheduled stock update');
            try {
                runStockUpdatePipeline();
            } catch (err) {
                logger.error(`ML: Error executing pipeline: ${err}`);
            }
        });
        
        logger.info('ML: Stock prediction scheduler activated');
    } catch (error) {
        logger.error(`Failed to initialize scheduler: ${error}`);
    }
}

/**
 * Run the pipeline immediately (for testing or manual trigger)
 */
function runPipelineNow() {
    logger.info('Manually triggering stock update pipeline');
    runStockUpdatePipeline();
}

module.exports = {
    initializeScheduler,
    runPipelineNow
};
