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

const app = express();

const corsOptions = {
    origin: "http://localhost:5173", // Your frontend's origin
    methods: "GET,POST,PUT,DELETE,PATCH",             // Specify methods you want to allow
    credentials: true,               // Allow credentials (cookies)
    allowedHeaders: ["Content-Type", "Authorization"],  
  };

app.use(cookieParser()); 

app.use(express.json());
app.use(cors(corsOptions));

// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 
app.use("/users/getUsers", userRoutes); 
app.use("/users/logoutUser", userRoutes);


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

module.exports = app;