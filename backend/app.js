require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const { swaggerUi, specs } = require("./docs/swagger"); 
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
// const pedidosHRoutes = require("./routes/pedidosH.js"); // Comentado porque el archivo no existe
//const pedidosProveedorRoutes = require("./routes/pedidosProveedor.js");
const rolRoutes = require("./routes/rol.js");
const locationRoutes = require("./routes/location");
//const mlRoutes = require("./routes/ml");
const articuloRoutes = require("./routes/articulo");
//const otpRoutes = require("./routes/otp"); // Added OTP routes
const alertasRoutes = require("./routes/alertas"); // Added Alertas routes
//const aiRoutes = require("./Ai_OpenAI/aiRoutes");
const kpiRoutes = require("./routes/kpi.js");
const ordenesRoutes = require("./routes/ordenes");
const ordenesProductosRoutes = require("./routes/ordenesProductos");

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
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

// roles routes
app.use("/rol", rolRoutes);

// locations routes
app.use("/location2", locationRoutes); 

// alertas routes
app.use("/alertas", alertasRoutes);

// articulo routes
app.use("/articulo", articuloRoutes);

// ordenes routes
app.use("/ordenes", ordenesRoutes);

// ordenes productos routes
app.use("/ordenesProductos", ordenesProductosRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);

// Comentados porque no están definidos
// app.use("/rol2", rol2Routes);
// app.use("/location2", location2Routes);
// app.use("/usuario2", usuario2Routes);
// app.use("/articulo2", articulo2Routes);
// app.use("/inventario2", inventario2Routes);
// app.use("/helpers", pedidosHelperRoutes);

app.use("/kpi", kpiRoutes);

module.exports = app;
