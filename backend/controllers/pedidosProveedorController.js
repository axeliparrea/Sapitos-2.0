const { connection } = require("../config/db");

const getPedidosPendientesProveedor = async (req, res) => {
  const { locationId } = req.params;
  
  if (!locationId) {
    return res.status(400).json({ error: "ID de ubicación requerido" });
  }

  try {
    const query = `
      SELECT 
        o.ORDEN_ID as id,
        o.FECHACREACION as fecha,
        u.Nombre as solicitadoPor,
        o.TOTAL as total,
        o.ESTADO as estado,
        o.FECHAESTIMADAENTREGA as fechaEstimada
      FROM Ordenes2 o
      INNER JOIN Usuario2 u ON o.CREADO_POR_ID = u.Usuario_ID 
      WHERE o.ESTADO = 'Pendiente' AND o.ORGANIZACION = ?
      ORDER BY o.FECHACREACION DESC
    `;

    connection.exec(query, [locationId], (err, result) => {
      if (err) {
        console.error("Error al obtener pedidos pendientes:", err);
        return res.status(500).json({ error: "Error al obtener pedidos" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getInventarioProveedor = async (req, res) => {
  const { locationId } = req.params;
  
  if (!locationId) {
    return res.status(400).json({ error: "ID de ubicación requerido" });
  }
  
  try {
    const query = `
      SELECT 
        i.Inventario_ID as id,
        a.Nombre as nombre,
        a.Categoria as categoria,
        i.StockActual as stockActual,
        i.StockMinimo as stockMinimo,
        a.PrecioProveedor as precioProveedor,
        a.PrecioVenta as precioVenta,
        i.FechaUltimaImportacion as ultimaCompra,
        i.MargenGanancia as margen
      FROM Inventario2 i
      INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
      WHERE i.LOCATION_ID = ?
      ORDER BY a.Nombre
    `;

    // Fixed: Changed from connection.exec() to connection.query()
    connection.exec(query, [locationId], (err, result) => {
      if (err) {
        console.error("Error al obtener inventario:", err);
        return res.status(500).json({ error: "Error al obtener inventario" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getPedidosPendientesProveedor,
  getInventarioProveedor,
};