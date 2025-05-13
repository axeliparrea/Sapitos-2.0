require('dotenv').config();
const hana = require('@sap/hana-client');

const connParams = {
    serverNode: process.env.SERVER_NODE, 
    uid: process.env.DB_USERNAME,
    pwd: process.env.DB_PASSWORD
};

const connection = hana.createConnection();

const connectDB = async () => {
    return new Promise((resolve, reject) => {
        connection.connect(connParams, (err) => {
            if (err) {
                console.error('Connection Error:', err);
                reject(err);
            } else {
                console.log('Connected to SAP HANA successfully!');
                resolve(connection);
            }
        });
    });
};

module.exports = { connection, connectDB };
