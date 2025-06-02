/**
 * Controller for ML model operations
 * 
 * Provides endpoints to manage ML model operations, including running the stock update pipeline
 * manually and checking the status of scheduled updates.
 */

const { runPipelineNow } = require('../services/stockUpdateScheduler');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Run the stock update pipeline manually
 */
const runModelUpdate = async (req, res) => {
    try {
        logger.info('Manual model update requested');
          // Check if user has required permissions (admin or similar)
        if (req.user && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para ejecutar esta acción' 
            });
        }
        
        // Run the pipeline
        runPipelineNow();
        
        return res.status(200).json({ 
            success: true, 
            message: 'Actualización de modelo iniciada correctamente. Revisa los logs para más detalles.' 
        });
    } catch (error) {
        logger.error(`Error in manual model update: ${error}`);
        return res.status(500).json({ 
            success: false, 
            message: 'Error al iniciar la actualización del modelo',
            error: error.message 
        });
    }
};

/**
 * Get logs from the last model update
 */
const getModelUpdateLogs = async (req, res) => {
    try {        // Check if user has required permissions
        if (req.user && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para ver los logs' 
            });
        }
          // Get the latest log file from mlops/logs directory
        const logsDir = path.join(__dirname, '..', '..', 'mlops', 'logs');
        
        logger.info(`Buscando logs en: ${logsDir}`);
        
        if (!fs.existsSync(logsDir)) {
            logger.warning(`Directorio de logs no encontrado: ${logsDir}`);
            return res.status(404).json({
                success: false,
                message: 'No se encontraron logs de actualización'
            });
        }
        
        // Get all log files
        const files = fs.readdirSync(logsDir)
            .filter(file => file.startsWith('weekly_stock_update_'))
            .sort()
            .reverse();
            
        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron logs de actualización'
            });
        }
        
        // Read the latest log file
        const latestLog = fs.readFileSync(path.join(logsDir, files[0]), 'utf8');
        
        return res.status(200).json({
            success: true,
            logFile: files[0],
            logContent: latestLog
        });
    } catch (error) {
        logger.error(`Error retrieving model logs: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Error al recuperar los logs de actualización',
            error: error.message
        });
    }
};

/**
 * Get information about the next scheduled update
 */
const getNextScheduledUpdate = async (req, res) => {
    try {
        // Read schedule from config file
        const configPath = path.join(__dirname, '..', '..', 'mlops', 'config', 'stock_update_config.py');
        logger.info(`Reading config from: ${configPath}`);
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Parse the Python config file to extract schedule parameters
        const dayMatch = configContent.match(/SCHEDULE_DAY\s*=\s*(\d+)/);
        const hourMatch = configContent.match(/SCHEDULE_HOUR\s*=\s*(\d+)/);
        const minuteMatch = configContent.match(/SCHEDULE_MINUTE\s*=\s*(\d+)/);
        
        const scheduleDay = dayMatch ? parseInt(dayMatch[1]) : 0; // Default to Monday (0)
        const scheduleHour = hourMatch ? parseInt(hourMatch[1]) : 1; // Default to 1 AM
        const scheduleMinute = minuteMatch ? parseInt(minuteMatch[1]) : 0; // Default to 0 minutes
        
        // Convert day number to day name
        const dayNames = [
            'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
        ];
        const dayName = dayNames[scheduleDay];
        
        // Calculate next occurrence
        const now = new Date();
        let nextRun = new Date();
        
        // Set the hour and minute
        nextRun.setHours(scheduleHour, scheduleMinute, 0, 0);
        
        // Set the day of week
        nextRun.setDate(now.getDate() + ((scheduleDay - now.getDay() + 7) % 7));
        
        // If the calculated time is in the past, add a week
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
        }
        
        return res.status(200).json({
            success: true,
            schedule: {
                day: dayName,
                hour: `${scheduleHour}:${scheduleMinute.toString().padStart(2, '0')}`,
                nextRun: nextRun.toISOString()
            }
        });
    } catch (error) {
        logger.error(`Error retrieving schedule information: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Error al recuperar información sobre la programación',
            error: error.message
        });
    }
};

/**
 * Get the current status of the ML model
 */
const getModelStatus = async (req, res) => {
    try {
        // Check if user has required permissions
        if (req.user && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para ver el estado del modelo' 
            });
        }
        
        // In production, this would check configuration or database
        // to determine if the model is active or inactive
        const configPath = path.join(__dirname, '..', '..', 'mlops', 'config', 'model_status.json');
        
        let status = 'inactive';
        let lastUpdated = null;
        
        if (fs.existsSync(configPath)) {
            try {
                const statusConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                status = statusConfig.status || 'inactive';
                lastUpdated = statusConfig.lastUpdated;
            } catch (err) {
                logger.error(`Error parsing model status config: ${err}`);
                // Continue using default values
            }
        } else {
            // If status file doesn't exist, check logs to determine if model is running
            const logsDir = path.join(__dirname, '..', '..', 'mlops', 'logs');
            
            if (fs.existsSync(logsDir)) {
                const files = fs.readdirSync(logsDir)
                    .filter(file => file.startsWith('weekly_stock_update_'))
                    .sort()
                    .reverse();
                
                if (files.length > 0) {
                    // If logs exist, consider the model active
                    status = 'active';
                    
                    // Get the date from the log filename (format: weekly_stock_update_YYYY-MM-DD.log)
                    const match = files[0].match(/weekly_stock_update_(\d{4}-\d{2}-\d{2})/);
                    if (match) {
                        lastUpdated = match[1];
                    }
                }
            }
        }
        
        return res.status(200).json({
            success: true,
            status: status,
            lastUpdated: lastUpdated
        });
    } catch (error) {
        logger.error(`Error retrieving model status: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Error al recuperar el estado del modelo',
            error: error.message
        });
    }
};

/**
 * Toggle model status (active/inactive)
 */
const toggleModelStatus = async (req, res) => {
    try {
        // Check if user has required permissions
        if (req.user && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para cambiar el estado del modelo' 
            });
        }
        
        const { status } = req.body;
        
        if (!status || (status !== 'active' && status !== 'inactive')) {
            return res.status(400).json({
                success: false,
                message: 'Estado de modelo inválido. Use "active" o "inactive".'
            });
        }
        
        // Update the model status configuration file
        const configPath = path.join(__dirname, '..', '..', 'mlops', 'config', 'model_status.json');
        const configDir = path.dirname(configPath);
        
        // Create config directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Save the status
        fs.writeFileSync(configPath, JSON.stringify({
            status: status,
            lastUpdated: new Date().toISOString()
        }));
        
        return res.status(200).json({
            success: true,
            message: `Modelo ${status === 'active' ? 'activado' : 'desactivado'} correctamente.`,
            status: status,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        logger.error(`Error toggling model status: ${error}`);
        return res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del modelo',
            error: error.message
        });
    }
};

module.exports = {
    runModelUpdate,
    getModelUpdateLogs,
    getNextScheduledUpdate,
    getModelStatus,
    toggleModelStatus
};
