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


app.use(cors({
  origin: ['https://axeliparrea.github.io', 'http://localhost:5173'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=()');
  next();
});

app.use(cookieParser()); 
app.set('trust proxy', 1);

app.use(express.json());


// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 
// app.use("users/getUsers", userRoutes); 


// inventory routes
app.use("/inventory", inventoryRoutes);

// ordenes routes
app.use("/ordenes", ordenesRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);


module.exports = app;
