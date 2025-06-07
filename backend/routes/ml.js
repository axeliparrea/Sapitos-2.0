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
    getNextScheduledUpdate,
    getModelStatus,
    toggleModelStatus
} = mlController;

const { auth } = require('../middleware/auth');
const { requireOtpVerification } = require('../middleware/requireOtp');

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
router.post('/update', auth(['admin'], true), requireOtpVerification, runModelUpdate);

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
router.get('/logs', auth(['admin'], true), requireOtpVerification, getModelUpdateLogs);

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
router.get('/schedule', auth(['admin'], true), requireOtpVerification, getNextScheduledUpdate);

/**
 * @swagger
 * /ml/status:
 *   get:
 *     summary: Get the current status of the ML model
 *     description: Returns whether the model is active or inactive, and when it was last updated
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Model status retrieved successfully
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/status', auth(['admin'], true), requireOtpVerification, getModelStatus);

/**
 * @swagger
 * /ml/toggle-status:
 *   post:
 *     summary: Toggle model status between active and inactive
 *     description: Activates or deactivates the model
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: The new status for the model
 *     responses:
 *       200:
 *         description: Model status toggled successfully
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.post('/toggle-status', auth(['admin'], true), requireOtpVerification, toggleModelStatus);

// Add route for model metrics
router.get('/metrics', auth(['admin'], true), requireOtpVerification, mlController.getModelMetrics);

module.exports = router;
