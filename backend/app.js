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
    origin: function(origin, callback) {
        const allowedOrigins = ["https://axeliparrea.github.io"];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cookieParser()); 
app.set('trust proxy', 1);

app.use(express.json());
app.use(cors(corsOptions));

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