const { connection } = require("../config/db");

const getLocations = (req, res) => {
  connection.exec("SELECT * FROM Location2", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const createLocation = (req, res) => {
  const { Nombre, Tipo, PosicionX, PosicionY, FechaCreado, Organizacion } = req.body;
  const query = `INSERT INTO Location2 (Nombre, Tipo, PosicionX, PosicionY, FechaCreado, Organizacion) VALUES (?, ?, ?, ?, ?, ?)`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Tipo, PosicionX, PosicionY, FechaCreado, Organizacion], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Ubicación creada" });
    });
  });
};

const updateLocation = (req, res) => {
  const { id } = req.params;
  const { Nombre, Tipo, PosicionX, PosicionY } = req.body;
  const query = `UPDATE Location2 SET Nombre = ?, Tipo = ?, PosicionX = ?, PosicionY = ? WHERE Location_ID = ?`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre, Tipo, PosicionX, PosicionY, id], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Ubicación actualizada" });
    });
  });
};

const deleteLocation = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Location2 WHERE Location_ID = ?`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([id], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.json({ message: "Ubicación eliminada" });
    });
  });
};

const getLocationById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM Location2 WHERE Location_ID = ?`;

  connection.exec(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Ubicación no encontrada" });
    }

    res.json(rows[0]);
  });
};


module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById
};

