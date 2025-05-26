require('dotenv').config();
const hana = require('@sap/hana-client');

const connParams = {
    serverNode: process.env.SERVER_NODE,
    uid: process.env.DB_USERNAME,
    pwd: process.env.DB_PASSWORD
};

const connection = hana.createConnection();

// Función para conectar con la base de datos
const connectDB = async () => {
    return new Promise((resolve, reject) => {
        if (connection.connected) {
            console.log('Ya existe una conexión activa a SAP HANA.');
            return resolve(connection);
        }

        connection.connect(connParams, (err) => {
            if (err) {
                console.error('❌ Error de conexión:', err);
                return reject(err);
            }

            console.log('✅ Conectado exitosamente a SAP HANA.');
            resolve(connection);
        });
    });
};

module.exports = { connection, connectDB };
