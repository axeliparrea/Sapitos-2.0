require('dotenv').config();
const hana = require('@sap/hana-client');
const logger = require('../utils/logger');

const getHanaCredentials = () => {
  try {
    // Para Cloud Foundry (producción)
    if (process.env.VCAP_SERVICES) {
      const vcap = JSON.parse(process.env.VCAP_SERVICES);
      
      // Buscar en diferentes servicios posibles donde podría estar HANA
      // Verificando cada paso para evitar errores "undefined"
      if (vcap.hana && vcap.hana[0] && vcap.hana[0].credentials) {
        const hanaCredentials = vcap.hana[0].credentials;
        console.log('Found HANA credentials in VCAP_SERVICES.hana');
        return {
          serverNode: `${hanaCredentials.host}:${hanaCredentials.port}`,
          uid: hanaCredentials.user,
          pwd: hanaCredentials.password,
          encrypt: 'true',
          sslValidateCertificate: 'false'
        };
      }
      
      // Buscar en user-provided-service (si se configuró uno)
      if (vcap['user-provided'] && vcap['user-provided'][0] && vcap['user-provided'][0].credentials) {
        const upsCredentials = vcap['user-provided'][0].credentials;
        console.log('Found HANA credentials in user-provided service');
        return {
          serverNode: `${upsCredentials.host}:${upsCredentials.port}`,
          uid: upsCredentials.user || upsCredentials.username,
          pwd: upsCredentials.password,
          encrypt: 'true',
          sslValidateCertificate: 'false'
        };
      }
    }

    // Usar variables de entorno directas (desde vars.yml)
    if (process.env.SERVER_NODE) {
      console.log('Using direct environment variables for HANA connection');
      return {
        serverNode: process.env.SERVER_NODE,
        uid: process.env.DB_USERNAME,
        pwd: process.env.DB_PASSWORD,
        encrypt: 'true',
        sslValidateCertificate: 'false'
      };
    }

    throw new Error('No HANA credentials found in environment');
  } catch (error) {
    console.error('Error retrieving HANA credentials:', error.message);
    throw error;
  }
};

const connection = hana.createConnection();

const connectDB = async () => {
  try {
    const connParams = getHanaCredentials();
    
    // Evitar registrar la contraseña en los logs
    console.log('Connecting to HANA with:', {
      serverNode: connParams.serverNode,
      uid: connParams.uid,
      // No mostramos pwd por seguridad
    });

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
  } catch (error) {
    console.error('Failed to get HANA credentials:', error);
    throw error;
  }
};

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  connection.disconnect();
  process.exit(0);
});

module.exports = { connection, connectDB };