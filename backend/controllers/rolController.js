const { connection } = require("../config/db");

const getRoles = (req, res) => {
  connection.exec("SELECT * FROM Rol2", [], (err, rows) => {
    if (err) {
      console.error("Error en la consulta de roles:", err);
      return res.status(500).json({ error: err.message });
    }

    // Asegúrate de que rows sea un array
    if (!Array.isArray(rows)) {
      console.error("Formato inesperado de filas:", rows);
      return res.status(500).json({ error: "Respuesta inesperada del servidor" });
    }

    res.json(rows);
  });
};


const createRol = (req, res) => {
  const { Nombre } = req.body;
  const query = `INSERT INTO Rol2 (Nombre) VALUES (?)`;
  connection.prepare(query, (err, statement) => {
    if (err) return res.status(500).json({ error: err.message });
    statement.exec([Nombre], (execErr) => {
      if (execErr) return res.status(500).json({ error: execErr.message });
      res.status(201).json({ message: "Rol creado" });
    });
  });
};

module.exports = { getRoles, createRol };
