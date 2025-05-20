require('dotenv').config();
const hana = require('@sap/hana-client');

const getHanaCredentials = () => {
  // Para Cloud Foundry (producción)
  if (process.env.VCAP_SERVICES) {
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    const hana = vcap.hana[0].credentials; // Ajusta 'hana' según tu servicio
    return {
      serverNode: `${hana.host}:${hana.port}`,
      uid: hana.user,
      pwd: hana.password,
      encrypt: 'true',
      sslValidateCertificate: 'false'
    };
  }

  // Para desarrollo local
  return {
    serverNode: process.env.SERVER_NODE,
    uid: process.env.DB_USERNAME,
    pwd: process.env.DB_PASSWORD,
    encrypt: 'true'
  };
};

const connection = hana.createConnection();

const connectDB = async () => {
  const connParams = getHanaCredentials();
  
  console.log('Connecting to HANA with:', {
    serverNode: connParams.serverNode,
    uid: connParams.uid
  });

  return new Promise((resolve, reject) => {
    connection.connect(connParams, (err) => {
      if (err) {
        console.error('HANA Connection Error:', err);
        reject(err);
      } else {
        console.log('Successfully connected to SAP HANA');
        resolve(connection);
      }
    });
  });
};

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  connection.disconnect();
  process.exit(0);
});

module.exports = { connection, connectDB };