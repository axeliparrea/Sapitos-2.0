const { connection } = require("../config/db");

// Obtener artículos
const getArticulos = (req, res) => {
  connection.exec("SELECT * FROM Articulo2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Crear artículo
const createArticulo = (req, res) => {
  const { Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada } = req.body;
  const query = `
    INSERT INTO Articulo2 (Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada)
    VALUES (?, ?, ?, ?, ?)`;

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Artículo creado" });
    });
  });
};

// Actualizar artículo
const updateArticulo = (req, res) => {
  const { id } = req.params;
  const { Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada } = req.body;
  const query = `
    UPDATE Articulo2 
    SET Nombre = ?, Categoria = ?, PrecioProveedor = ?, PrecioVenta = ?, Temporada = ?
    WHERE Articulo_ID = ?`;

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada, id], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Artículo actualizado" });
    });
  });
};

const deleteArticulo = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Articulo2 WHERE Articulo_ID = ?`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([id], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Artículo eliminado correctamente" });
    });
  });
};


module.exports = {
  getArticulos,
  createArticulo,
  updateArticulo,
  deleteArticulo
};
