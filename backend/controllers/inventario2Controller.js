const { connection } = require("../config/db");

// Obtener todos los inventarios
const getInventario = (req, res) => {
  connection.exec("SELECT * FROM Inventario2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Crear inventario
const createInventario = (req, res) => {
  const data = req.body;
  const query = `
  INSERT INTO Inventario2 (
    Articulo_ID, Location_ID, StockActual, Importacion, Exportacion,
    StockMinimo, StockRecomendado, FechaUltimaImportacion, FechaUltimaExportacion,
    MargenGanancia, TiempoReposicion, StockSeguridad, DemandaPromedio
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


  const values = [
    data.Articulo_ID, data.Location_ID, data.StockActual, data.Importacion,
    data.Exportacion, data.StockMinimo, data.StockRecomend, data.FechaUltimaImp,
    data.FechaUltimaExp, data.MargenGanancia, data.TiempoReposi,
    data.StockSeguridad, data.DemandaProm,
  ];

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec(values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Inventario creado" });
    });
  });
};

// Actualizar inventario
const updateInventario = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = `
    UPDATE Inventario2 SET
      Articulo_ID = ?, Location_ID = ?, StockActual = ?, Importacion = ?, Exportacion = ?,
      StockMinimo = ?, StockRecomendado = ?, FechaUltimaImportacion = ?, FechaUltimaExportacion = ?,
      MargenGanancia = ?, TiempoReposicion = ?, StockSeguridad = ?, DemandaPromedio = ?
    WHERE Inventario_ID = ?`;

  const values = [
    data.Articulo_ID, data.Location_ID, data.StockActual, data.Importacion,
    data.Exportacion, data.StockMinimo, data.StockRecomend, data.FechaUltimaImp,
    data.FechaUltimaExp, data.MargenGanancia, data.TiempoReposi,
    data.StockSeguridad, data.DemandaProm, id
  ];

  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec(values, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Inventario actualizado" });
    });
  });
};

// Borrar inventario
const deleteInventario = (req, res) => {
  const id = req.params.id;
  connection.prepare("DELETE FROM Inventario2 WHERE Inventario_ID = ?", (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Inventario eliminado" });
    });
  });
};

module.exports = {
  getInventario,
  createInventario,
  updateInventario,
  deleteInventario
};
