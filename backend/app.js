require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const { swaggerUi, specs } = require("./docs/swagger"); 
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
const ordenesRoutes = require("./routes/ordenes");
const rol2Routes = require("./routes/rol2");
const location2Routes = require("./routes/location2");
const usuario2Routes = require("./routes/usuario2");
const articulo2Routes = require("./routes/articulo2");
const inventario2Routes = require("./routes/inventario2");


const app = express();

const corsOptions = {
    origin: "http://localhost:5173", // Your frontend's origin
    methods: "GET,POST,PUT,DELETE",             // Specify methods you want to allow
    credentials: true,               // Allow credentials (cookies)
  };

app.use(cookieParser()); 

app.use(express.json());
app.use(cors(corsOptions));

// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); 
app.use("/users/getUsers", userRoutes); 


// inventory routes
app.use("/inventory", inventoryRoutes);

// ordenes routes
app.use("/ordenes", ordenesRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);

// rol2 routes
app.use("/rol2", rol2Routes);

// location2 routes
app.use("/location2", location2Routes);


// usuario2 routes
app.use("/usuario2", usuario2Routes);

// articulo2 routes
app.use("/articulo2", articulo2Routes);

// inventario2 routes
app.use("/inventario2", inventario2Routes);


module.exports = app;