const { connection } = require("../config/db");

const getLocations = (req, res) => {
  connection.exec("SELECT * FROM Location2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const createLocation = (req, res) => {
  const { Nombre, Tipo, PosicionX, PosicionY, FechaCreado } = req.body;
  const query = `INSERT INTO Location2 (Nombre, Tipo, PosicionX, PosicionY, FechaCreado) VALUES (?, ?, ?, ?, ?)`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Tipo, PosicionX, PosicionY, FechaCreado], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Ubicación creada" });
    });
  });
};

module.exports = { getLocations, createLocation };
