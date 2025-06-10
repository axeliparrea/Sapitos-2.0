require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  
const { swaggerUi, specs } = require("./docs/swagger");
const { connection } = require("./config/db");

const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
const pedidosHRoutes = require("./routes/pedidosH.js");
const pedidosProveedorRoutes = require("./routes/pedidosProveedor.js");
const rolRoutes = require("./routes/rol.js");
const locationRoutes = require("./routes/location");
const mlRoutes = require("./routes/ml");
const articuloRoutes = require("./routes/articulo");
const otpRoutes = require("./routes/otp"); // Added OTP routes
const alertasRoutes = require("./routes/alertas"); // Added Alertas routes
const aiRoutes = require("./Ai_OpenAI/aiRoutes");
const pedidosHelperRoutes = require("./routes/pedidosH");
const kpiRoutes = require("./routes/kpi.js");
const ordenesRoutes = require("./routes/ordenes");


const app = express();

const corsOptions = {
    origin: "http://localhost:5173", // Your frontend's origin
    methods: "GET,POST,PUT,DELETE,PATCH,PATCH",             // Specify methods you want to allow
    credentials: true,               // Allow credentials (cookies)
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],  
    allowedHeaders: ["Content-Type", "Authorization"],  
  };

app.use(cookieParser()); 

app.use(express.json());
app.use(cors(corsOptions));

// OTP routes
app.use("/api/otp", otpRoutes); 
const settingsRoutes = require("./routes/settings");
app.use("/api/settings", settingsRoutes);

// login, register, and logout routes
app.use("/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/users/getUsers", userRoutes); 
app.use("/users/logoutUser", userRoutes);
app.use("/users/logoutUser", userRoutes);

// ML model routes
app.use("/ml", mlRoutes);

// inventory routes
app.use("/inventory", inventoryRoutes);

// roles routes
app.use("/rol", rolRoutes);

// ordenes routes
app.use("/ordenes", ordenesRoutes); // 👈 Esta línea debe existir

// locations routes
app.use("/location2", locationRoutes); 

// alertas routes
app.use("/alertas", alertasRoutes);

// articulo routes
app.use("/articulo", articuloRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);
app.use("/proveedores", pedidoRoutes);
app.use("/pedidosH", pedidosHRoutes);
app.use("/proveedor", pedidosProveedorRoutes);
app.use("/proveedores", pedidoRoutes);
app.use("/pedidosH", pedidosHRoutes);
app.use("/proveedor", pedidosProveedorRoutes);

// rutas para el asistente de IA 
app.use("/api/ai", aiRoutes);

app.use("/helpers", pedidosHelperRoutes);
app.use("/kpi", kpiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;