const { connection } = require("../config/db");

const executeKpiQuery = (res, query, kpiName) => {
  connection.exec(query, [], (err, rows) => {
    if (err) {
      console.error(`Error al obtener KPI de ${kpiName}:`, err);
      return res.status(500).json({ error: `Error al obtener KPI de ${kpiName}` });
    }

    const current = parseFloat(rows[0]?.CURRENT_TOTAL || 0);
    const previous = parseFloat(rows[0]?.PREVIOUS_TOTAL || 0);

    const percentageChange = previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0 ? 100 : 0;

    res.json({
        total: current,
        percentage_change: percentageChange
    });
  });
};

// KPI ventas: usa la tabla historialproductos2 promediada por mes las ventas totales
const getVentasKpi = (req, res) => {
  const query = `
    WITH MonthlyData AS (
        SELECT
            hp.Anio,
            hp.Mes,
            SUM(hp.Exportacion * a.PrecioVenta) AS ventas_totales
        FROM HistorialProductos2 hp
        JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
        JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
        GROUP BY hp.Anio, hp.Mes
    ),
    RankedData AS (
        SELECT
            ventas_totales,
            ROW_NUMBER() OVER (ORDER BY Anio DESC, Mes DESC) as rn
        FROM MonthlyData
    )
    SELECT
        (SELECT ventas_totales FROM RankedData WHERE rn = 1) AS current_total,
        (SELECT ventas_totales FROM RankedData WHERE rn = 2) AS previous_total
    FROM DUMMY;
  `;
  executeKpiQuery(res, query, "ventas");
};

// KPI unidades:usa la tabla historialproductos2 promediada por mes el stock total
const getUnidadesKpi = (req, res) => {
  const query = `
    WITH MonthlyData AS (
        SELECT
            Anio,
            Mes,
            SUM(StockEnd) as stock_total
        FROM HistorialProductos2
        GROUP BY Anio, Mes
    ),
    RankedData AS (
        SELECT
            stock_total,
            ROW_NUMBER() OVER (ORDER BY Anio DESC, Mes DESC) as rn
        FROM MonthlyData
    )
    SELECT
        (SELECT stock_total FROM RankedData WHERE rn = 1) AS current_total,
        (SELECT stock_total FROM RankedData WHERE rn = 2) AS previous_total
    FROM DUMMY;
  `;
  executeKpiQuery(res, query, "unidades");
};

// KPI articulos: usa el inventario en distinct de articulo id
const getArticulosKpi = (req, res) => {
    const query = `
    WITH MonthlyData AS (
        SELECT
            hp.Anio,
            hp.Mes,
            COUNT(DISTINCT i.Articulo_ID) as total_articulos
        FROM HistorialProductos2 hp
        JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
        GROUP BY hp.Anio, hp.Mes
    ),
    RankedData AS (
        SELECT
            total_articulos,
            ROW_NUMBER() OVER (ORDER BY Anio DESC, Mes DESC) as rn
        FROM MonthlyData
    )
    SELECT
        (SELECT total_articulos FROM RankedData WHERE rn = 1) AS current_total,
        (SELECT total_articulos FROM RankedData WHERE rn = 2) AS previous_total
    FROM DUMMY;
  `;
  executeKpiQuery(res, query, "artículos");
};

// KPI clientes: usa el total de ordenes y metodos de pago cpromediados completados cada mes
const getClientesKpi = (req, res) => {
  const query = `
    WITH MonthlyData AS (
        SELECT
            YEAR(FechaCreacion) as anio,
            MONTH(FechaCreacion) as mes,
            COUNT(DISTINCT Creado_por_ID) as clientes_activos
        FROM Ordenes2
        WHERE Estado = 'Completado'
        GROUP BY YEAR(FechaCreacion), MONTH(FechaCreacion)
    ),
    RankedData AS (
        SELECT
            clientes_activos,
            ROW_NUMBER() OVER (ORDER BY anio DESC, mes DESC) as rn
        FROM MonthlyData
    )
    SELECT
        (SELECT clientes_activos FROM RankedData WHERE rn = 1) AS current_total,
        (SELECT clientes_activos FROM RankedData WHERE rn = 2) AS previous_total
    FROM DUMMY;
  `;
  executeKpiQuery(res, query, "clientes");
};

// Grafica unidades vendidas: usa la tabla historialproductos2
const getUnidadesVendidasGraph = (req, res) => {
  const { filter } = req.query; // 'yearly' or 'monthly'

  let query;
  if (filter === 'yearly') {
    query = `
      SELECT
          Anio,
          SUM(Exportacion) as unidades_vendidas
      FROM HistorialProductos2
      GROUP BY Anio
      ORDER BY Anio;
    `;
  } else { // default to monthly
    query = `
      SELECT
          Anio,
          Mes,
          SUM(Exportacion) as unidades_vendidas
      FROM HistorialProductos2
      GROUP BY Anio, Mes
      ORDER BY Anio, Mes;
    `;
  }

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