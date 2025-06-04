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
    try {
        const scriptPath = path.join(__dirname, '..', '..', 'mlops', 'pipelines', 'weekly_stock_update.py');
        
        if (!fs.existsSync(scriptPath)) {
            logger.error('Pipeline script no encontrado');
            return;
        }
        
        // Ejecutar el script de actualización
        
        // Try different Python commands (python3, python, py) to improve compatibility
        // Prioritize Python launcher on Windows for compatibility
        const pythonCommands = process.platform === 'win32'
            ? ['py', 'python', 'python3']
            : ['python3', 'python', 'py'];
        let pythonProcess = null;
        let commandUsed = '';
        
        for (const cmd of pythonCommands) {
            try {
                // Try to spawn the process with the current command
                // Run script with cwd set to its pipeline folder to resolve relative paths correctly
                pythonProcess = spawn(cmd, [scriptPath], { shell: true, cwd: path.dirname(scriptPath) });
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
        
        logger.info('Iniciando actualización de modelo...');
        
        pythonProcess.on('close', (code) => {
            // Path to model status config
            const statusPath = path.join(__dirname, '..', '..', 'mlops', 'config', 'model_status.json');
            const statusObj = { status: code === 0 ? 'active' : 'inactive', lastUpdated: new Date().toISOString() };
            try {
                fs.writeFileSync(statusPath, JSON.stringify(statusObj, null, 2), 'utf8');
                logger.info(code === 0 ? 'Estado de modelo actualizado a activo' : 'Estado de modelo actualizado a inactivo');
            } catch (err) {
                logger.error(`Error actualizando model_status.json: ${err.message}`);
            }
            // Log pipeline result
            if (code === 0) {
                logger.info('Actualización completada correctamente');
            } else {
                logger.error(`Actualización fallida con código ${code}`);
            }
        });
    } catch (error) {
        logger.error(`Error al ejecutar pipeline: ${error}`);
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
    logger.info('Manual trigger of stock update pipeline');
    return new Promise((resolve, reject) => {
        try {
            const result = runStockUpdatePipeline();
            // Detect the Python process inside runStockUpdatePipeline
            // We need access to the spawned process; adjust runStockUpdatePipeline to return it
        } catch (err) {
            return reject(err);
        }
    });
}

module.exports = {
    initializeScheduler,
    runPipelineNow
};
