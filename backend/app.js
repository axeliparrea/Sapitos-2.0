require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');  

const { swaggerUi, specs } = require("./docs/swagger"); 
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const pedidoRoutes = require("./routes/pedido");
<<<<<<< Updated upstream
const ordenesRoutes = require("./routes/ordenes");
const rol2Routes = require("./routes/rol2");
const location2Routes = require("./routes/location2");
const usuario2Routes = require("./routes/usuario2");
const articulo2Routes = require("./routes/articulo2");
const inventario2Routes = require("./routes/inventario2");
=======
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

const ordenesProductosRoutes = require("./routes/ordenesProductos");


>>>>>>> Stashed changes


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

<<<<<<< Updated upstream
// ordenes routes
app.use("/ordenes", ordenesRoutes);
=======

// roles routes
app.use("/rol", rolRoutes);

// locations routes
app.use("/location2", locationRoutes); 

// alertas routes
app.use("/alertas", alertasRoutes);

// articulo routes
app.use("/articulo", articuloRoutes);
>>>>>>> Stashed changes

// ordenes routes
app.use("/ordenes", ordenesRoutes);

// ordenes productos routes
app.use("/ordenesProductos", ordenesProductosRoutes);

// pedidos routes
app.use("/pedido", pedidoRoutes);

// rol2 routes
app.use("/rol2", rol2Routes);

<<<<<<< Updated upstream
// location2 routes
app.use("/location2", location2Routes);


// usuario2 routes
app.use("/usuario2", usuario2Routes);

// articulo2 routes
app.use("/articulo2", articulo2Routes);

// inventario2 routes
app.use("/inventario2", inventario2Routes);
=======

app.use("/helpers", pedidosHelperRoutes);
app.use("/kpi", kpiRoutes);
>>>>>>> Stashed changes


module.exports = app;