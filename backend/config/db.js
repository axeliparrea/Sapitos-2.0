require('dotenv').config();
const hana = require('@sap/hana-client');
const logger = require('../utils/logger');

const connParams = {
    serverNode: process.env.SERVER_NODE, 
    uid: process.env.DB_USERNAME,
    pwd: process.env.DB_PASSWORD
};

const connection = hana.createConnection();

const connectDB = async () => {
    return new Promise((resolve, reject) => {
        // Try to simplify the connection errors if they occur
        connection.connect(connParams, (err) => {
            if (err) {
                // Clean up the error message for better terminal output
                let errorMsg = 'Database connection error';
                
                if (err.message) {
                    // Extract only the important parts of SAP HANA errors
                    if (err.message.includes('Connection failed')) {
                        errorMsg = 'HANA connection failed - check server availability';
                    } else if (err.message.includes('authentication failed')) {
                        errorMsg = 'HANA authentication failed - check credentials';
                    } else {
                        // Truncate long error messages
                        errorMsg = `HANA: ${err.message.substring(0, 100)}`;
                    }
                }
                
                logger.error(errorMsg);
                reject(err);
            } else {
                logger.info('Database connected successfully');
                resolve(connection);
            }
        });
    });
};

module.exports = { connection, connectDB };
