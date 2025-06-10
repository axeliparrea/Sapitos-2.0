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
  const { locationId } = req.query;
  
  let query = `
    WITH MonthlyData AS (
        SELECT
            hp.Anio,
            hp.Mes,
            SUM(hp.Exportacion * a.PrecioVenta) AS ventas_totales
        FROM HistorialProductos2 hp
        JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
        JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID`;
  
  // Add location filter if provided
  if (locationId && locationId !== 'undefined' && locationId !== 'null') {
    query += ` WHERE i.Location_ID = ${parseInt(locationId)}`;
  }
  
  query += `
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
  const { locationId } = req.query;
  
  let query = `
    WITH MonthlyData AS (
        SELECT
            hp.Anio,
            hp.Mes,
            SUM(hp.StockEnd) as stock_total
        FROM HistorialProductos2 hp`;
  
  // Add location filter if provided
  if (locationId && locationId !== 'undefined' && locationId !== 'null') {
    query += `
        JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
        WHERE i.Location_ID = ${parseInt(locationId)}`;
  }
  
  query += `
        GROUP BY hp.Anio, hp.Mes
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
    const { locationId } = req.query;
    
    let query = `
    WITH MonthlyData AS (
        SELECT
            hp.Anio,
            hp.Mes,
            COUNT(DISTINCT i.Articulo_ID) as total_articulos
        FROM HistorialProductos2 hp
        JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID`;
    
    // Add location filter if provided
    if (locationId && locationId !== 'undefined' && locationId !== 'null') {
        query += ` WHERE i.Location_ID = ${parseInt(locationId)}`;
    }
    
    query += `
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
  const { locationId } = req.query;
  
  let query = `
    WITH MonthlyData AS (
        SELECT
            YEAR(o.FechaCreacion) as anio,
            MONTH(o.FechaCreacion) as mes,
            COUNT(DISTINCT o.Creado_por_ID) as clientes_activos
        FROM Ordenes2 o`;
  
  // Add location filter if provided
  if (locationId && locationId !== 'undefined' && locationId !== 'null') {
    query += `
        JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID
        WHERE o.Estado = 'Completado' AND u.Location_ID = ${parseInt(locationId)}`;
  } else {
    query += ` WHERE o.Estado = 'Completado'`;
  }
  
  query += `
        GROUP BY YEAR(o.FechaCreacion), MONTH(o.FechaCreacion)
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
  const { filter, locationId } = req.query; // 'yearly' or 'monthly'

  let query;
  if (filter === 'yearly') {
    query = `
      SELECT
          hp.Anio,
          SUM(hp.Exportacion) as unidades_vendidas
      FROM HistorialProductos2 hp`;
    
    // Add location filter if provided
    if (locationId && locationId !== 'undefined' && locationId !== 'null') {
      query += `
      JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
      WHERE i.Location_ID = ${parseInt(locationId)}`;
    }
    
    query += `
      GROUP BY hp.Anio
      ORDER BY hp.Anio;
    `;
  } else { // default to monthly
    query = `
      SELECT
          hp.Anio,
          hp.Mes,
          SUM(hp.Exportacion) as unidades_vendidas
      FROM HistorialProductos2 hp`;
    
    // Add location filter if provided
    if (locationId && locationId !== 'undefined' && locationId !== 'null') {
      query += `
      JOIN Inventario2 i ON hp.Inventario_ID = i.Inventario_ID
      WHERE i.Location_ID = ${parseInt(locationId)}`;
    }
    
    query += `
      GROUP BY hp.Anio, hp.Mes
      ORDER BY hp.Anio, hp.Mes;
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