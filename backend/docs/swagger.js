const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.BACK_PORT || 5000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SAP Backend API",
      version: "1.0.0",
      description: "API para gestión de usuarios, roles, artículos y ubicaciones con autenticación JWT",
      contact: {
        name: "Equipo de Desarrollo",
        email: "soporte@example.com", // Opcional
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token", // Asegúrate de que coincide con res.cookie() en login
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./routes/*.js"], // Escanea comentarios Swagger en rutas
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
