/**
 * ML model routes
 * 
 * Routes for machine learning model operations, including manual updates
 * and checking scheduled update status.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Determine which controller to use based on environment
let mlController;
try {
    // Check if Python ML setup exists
    const mlopsDir = path.join(__dirname, '..', '..', 'mlops');
    const configPath = path.join(mlopsDir, 'config', 'stock_update_config.py');
    
    if (fs.existsSync(configPath)) {
        // Use production controller if ML setup exists
        mlController = require('../controllers/mlModelController');
    } else {
        // Fall back to development controller
        mlController = require('../controllers/mlModelControllerDev');
    }
} catch (error) {
    // Fall back to development controller on any error
    mlController = require('../controllers/mlModelControllerDev');
}

const { 
    runModelUpdate, 
    getModelUpdateLogs, 
    getNextScheduledUpdate 
} = mlController;

const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /ml/update:
 *   post:
 *     summary: Trigger a manual stock minimum update
 *     description: Runs the stock prediction model and updates stock minimums in the database
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Update started successfully
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/update', auth(['admin']), runModelUpdate);

/**
 * @swagger
 * /ml/logs:
 *   get:
 *     summary: Get logs from the last model update
 *     description: Returns the logs from the most recent stock minimum update
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Logs not found
 *       500:
 *         description: Server error
 */
router.get('/logs', auth(['admin']), getModelUpdateLogs);

/**
 * @swagger
 * /ml/schedule:
 *   get:
 *     summary: Get information about the next scheduled update
 *     description: Returns details about when the next automatic update will run
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedule information retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/schedule', auth(['admin']), getNextScheduledUpdate);

module.exports = router;
