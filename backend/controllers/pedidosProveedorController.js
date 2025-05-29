const { connection } = require("../config/db");

const getHistorialProveedor = (req, res) => {
  const { nombre } = req.params;
  const query = `
    SELECT 
      o.Orden_ID,
      o.FechaCreacion,
      o.FechaEntrega,
      o.Estado,
      a.Nombre AS producto,
      op.Cantidad,
      op.PrecioUnitario,
      (op.Cantidad * op.PrecioUnitario) AS totalLinea
    FROM Ordenes2 o
    INNER JOIN OrdenesProductos2 op ON o.Orden_ID = op.Orden_ID
    INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
    INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
    WHERE o.Organizacion = ?
      AND o.Estado IN ('Aprobado', 'En Reparto', 'Completado')
    ORDER BY o.FechaCreacion DESC
  `;
  connection.exec(query, [nombre], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al obtener historial" });
    res.status(200).json(result || []);
  });
};

// Propuestas pendientes
const getPendientesProveedor = (req, res) => {
  const { nombre } = req.params;
  const query = `
    SELECT 
      o.Orden_ID,
      o.FechaCreacion,
      u.Nombre AS solicitadoPor,
      a.Nombre AS producto,
      op.Cantidad,
      op.PrecioUnitario,
      (op.Cantidad * op.PrecioUnitario) AS totalLinea
    FROM Ordenes2 o
    INNER JOIN OrdenesProductos2 op ON o.Orden_ID = op.Orden_ID
    INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
    INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
    INNER JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID
    WHERE o.Organizacion = ?
      AND o.Estado = 'Pendiente'
    ORDER BY o.FechaCreacion DESC
  `;
  connection.exec(query, [nombre], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al obtener pendientes" });
    res.status(200).json(result || []);
  });
};

module.exports = { getHistorialProveedor, getPendientesProveedor };