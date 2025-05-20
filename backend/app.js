require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const { swaggerUi, specs } = require("./docs/swagger"); 
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
const ordenesRoutes = require("./routes/ordenes");

const app = express();

const corsOptions = {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"], // Your frontend's origin
    methods: "GET,POST,PUT,DELETE",             // Specify methods you want to allow
    credentials: true,               // Allow credentials (cookies)
  };

app.use(cookieParser()); 

app.use(express.json());
app.use(cors(corsOptions));

// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 
app.use("users/getUsers", userRoutes); 


// inventory routes
app.use("/inventory", inventoryRoutes);

// ordenes routes
app.use("/ordenes", ordenesRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);


module.exports = app;