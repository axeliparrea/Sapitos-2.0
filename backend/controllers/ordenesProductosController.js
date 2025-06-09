const { connection } = require("../config/db");

// Obtener todos los productos en órdenes
const getOrdenesProductos = (req, res) => {
  connection.exec("SELECT * FROM OrdenesProductos2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Obtener productos por Orden_ID
const getByOrdenId = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM OrdenesProductos2 WHERE Orden_ID = ?";
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([id], (execErr, rows) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json(rows);
    });
  });
};

// Crear producto de orden
const createOrdenProducto = (req, res) => {
  const { Orden_ID, Inventario_ID, Cantidad, PrecioUnitario } = req.body;
  const query = `
    INSERT INTO OrdenesProductos2 (Orden_ID, Inventario_ID, Cantidad, PrecioUnitario)
    VALUES (?, ?, ?, ?)
  `;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Orden_ID, Inventario_ID, Cantidad, PrecioUnitario], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Producto de orden creado exitosamente" });
    });
  });
};

// Eliminar producto de una orden
const deleteOrdenProducto = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM OrdenesProductos2 WHERE OrdenesProductos_ID = ?";
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([id], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Producto eliminado de la orden" });
    });
  });
};

const getDetallePorOrden = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      op.OrdenesProductos_ID,
      op.Cantidad,
      op.PrecioUnitario,
      i.Inventario_ID,
      i.StockActual,
      a.ARTICULO_ID,
      a.Nombre AS NombreArticulo,
      a.Categoria
    FROM OrdenesProductos2 op
    JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
    JOIN Articulo2 a ON i.Articulo_ID = a.ARTICULO_ID
    WHERE op.Orden_ID = ?
  `;

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });

    statement.exec([id], (execErr, rows) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json(rows);
    });
  });
};




module.exports = {
  getOrdenesProductos,
  getByOrdenId,
  createOrdenProducto,
  deleteOrdenProducto,
  getDetallePorOrden
};
