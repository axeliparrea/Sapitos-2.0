const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.BACK_PORT || 5000; 

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description: "API for user authentication and management",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Scan all route files for Swagger comments
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
