require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const { swaggerUi, specs } = require("./docs/swagger"); 
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
const pedidosHRoutes = require("./routes/pedidosH.js");
const pedidosProveedorRoutes = require("./routes/pedidosProveedor.js");
const rolRoutes = require("./routes/rol.js");
const locationRoutes = require("./routes/location"); // al inicio
const mlRoutes = require("./routes/ml");

const app = express();

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    "https://sapitos-frontend.cfapps.us10-001.hana.ondemand.com", "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], "Cache-Control", "Pragma", "Expires"],
};
app.use(cors(corsOptions));

app.use(cookieParser()); 

app.use(express.json());

// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 
app.use("//users/getUsers", userRoutes); 
app.use("/users/logoutUser", userRoutes);
app.use("/users/logoutUser", userRoutes);

// ML model routes
app.use("/ml", mlRoutes);

// inventory routes
app.use("/inventory", inventoryRoutes);

// roles routes
app.use("/rol", rolRoutes);

// locations routes
app.use("/location2", locationRoutes); // junto a tus otras rutas

// pedidos routes
app.use("/pedido", pedidoRoutes);
app.use("/proveedores", pedidoRoutes);
app.use("/pedidosH", pedidosHRoutes);
app.use("/proveedor", pedidosProveedorRoutes);
app.use("/proveedores", pedidoRoutes);
app.use("/pedidosH", pedidosHRoutes);
app.use("/proveedor", pedidosProveedorRoutes);

module.exports = app;