const { connection } = require("../config/db");

// KPI ventas: usa la tabla historialproductos2 promediada por mes las ventas totales
const getVentasKpi = (req, res) => {
  // Query to get total sales per month
  const query = `
    SELECT
        hp.Anio,
        hp.Mes,
        SUM(hp.Exportacion * a.PrecioVenta) AS ventas_totales
    FROM HistorialProductos2 hp
    JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
    JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
    GROUP BY hp.Anio, hp.Mes
    ORDER BY hp.Anio, hp.Mes;
  `;

  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener KPI de ventas:", err);
      return res.status(500).json({ error: "Error al obtener KPI de ventas" });
    }
    res.json(rows);
  });
};

// KPI unidades:usa la tabla historialproductos2 promediada por mes el stock total
const getUnidadesKpi = (req, res) => {
  // Query to get total units sold per month
  const query = `
    SELECT
        Anio,
        Mes,
        SUM(StockEnd) as stock_total
    FROM HistorialProductos2
    GROUP BY Anio, Mes
    ORDER BY Anio, Mes;
  `;

  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener KPI de unidades:", err);
      return res.status(500).json({ error: "Error al obtener KPI de unidades" });
    }
    res.json(rows);
  });
};

// KPI articulos: usa el inventario en distinct de articulo id
const getArticulosKpi = (req, res) => {
  const query = "SELECT COUNT(DISTINCT Articulo_ID) as total_articulos FROM Inventario2";

  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener KPI de articulos:", err);
      return res.status(500).json({ error: "Error al obtener KPI de articulos" });
    }
    res.json(rows[0]);
  });
};

// KPI clientes: usa el total de ordenes y metodos de pago cpromediados completados cada mes
const getClientesKpi = (req, res) => {
  // Query to get total completed orders per month
  const query = `
    SELECT
        YEAR(FechaCreacion) as anio,
        MONTH(FechaCreacion) as mes,
        COUNT(DISTINCT Creado_por_ID) as clientes_activos
    FROM Ordenes2
    WHERE Estado = 'Completado'
    GROUP BY anio, mes
    ORDER BY anio, mes;
  `;

  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener KPI de clientes:", err);
      return res.status(500).json({ error: "Error al obtener KPI de clientes" });
    }
    res.json(rows);
  });
};

// Grafica unidades vendidas: usa la tabla historialproductos2
const getUnidadesVendidasGraph = (req, res) => {
  // Query to get units sold per day
  const query = `
    SELECT
        Anio,
        Mes,
        SUM(Exportacion) as unidades_vendidas
    FROM HistorialProductos2
    GROUP BY Anio, Mes
    ORDER BY Anio, Mes;
  `;

  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener datos para gráfica de unidades vendidas:", err);
      return res.status(500).json({ error: "Error al obtener datos para gráfica de unidades vendidas" });
    }
    res.json(rows);
  });
};

module.exports = {
  getVentasKpi,
  getUnidadesKpi,
  getArticulosKpi,
  getClientesKpi,
  getUnidadesVendidasGraph,
}; 