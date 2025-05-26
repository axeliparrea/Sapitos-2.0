const { connection } = require("../config/db");

const getArticulos = (req, res) => {
  connection.exec("SELECT * FROM Articulo2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const createArticulo = (req, res) => {
  const { Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada } = req.body;
  const query = `INSERT INTO Articulo2 (Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada) VALUES (?, ?, ?, ?, ?)`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Categoria, PrecioProveedor, PrecioVenta, Temporada], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Artículo creado" });
    });
  });
};

module.exports = { getArticulos, createArticulo };
