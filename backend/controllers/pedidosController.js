const { connection } = require("../config/db");
const jwt = require("jsonwebtoken");

const getPedido = async (req, res) => {
  try {
    const query = `
      SELECT
        ID,
        CREADA_POR,
        FECHACREACION,
        FECHAESTIMAACEPTACION,
        FECHAACEPTACION,
        FECHAESTIMAPAGO,
        FECHAPAGO,
        COMPROBANTEPAGO,
        FECHAESTIMAENTREGA,
        FECHAENTREGA,
        ENTREGAATIEMPO,
        CALIDAD,
        ESTATUS,
        TOTAL,
        METODOPAGO,
        DESCUENTOAPLICADO,
        TIEMPOREPOSICION,
        TIEMPOENTREGA
      FROM DBADMIN.Ordenes
    `;

    connection.exec(query, [], async (err, result) => {
      if (err) {
        console.error("Error al obtener los pedidos", err);
        return res.status(500).json({ error: "Error al obtener los pedidos" });
      }

      // Asegúrate de que result sea un array
      if (!Array.isArray(result)) {
        result = [];
        console.error("La consulta no devolvió un array:", result);
      }

      const formatted = result.map(pedido => ({
        id: pedido.ID,
        creadaPor: pedido.CREADA_POR,
        fechaCreacion: pedido.FECHACREACION,
        fechaEstimaAceptacion: pedido.FECHAESTIMAACEPTACION,
        fechaAceptacion: pedido.FECHAACEPTACION,
        fechaEstimaPago: pedido.FECHAESTIMAPAGO,
        fechaPago: pedido.FECHAPAGO,
        comprobantePago: pedido.COMPROBANTEPAGO,
        fechaEstimaEntrega: pedido.FECHAESTIMAENTREGA,
        fechaEntrega: pedido.FECHAENTREGA,
        entregaATiempo: pedido.ENTREGAATIEMPO,
        calidad: pedido.CALIDAD,
        estatus: pedido.ESTATUS,
        total: pedido.TOTAL,
        metodoPago: pedido.METODOPAGO,
        descuentoAplicado: pedido.DESCUENTOAPLICADO,
        tiempoReposicion: pedido.TIEMPOREPOSICION,
        tiempoEntrega: pedido.TIEMPOENTREGA
      }));

      // Enviar los datos en un formato que el frontend espera
      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};



const insertPedido = async (req, res) => {
  try {
    const {
      creadaPor,
      fechaCreacion,
      fechaEstimaAceptacion,
      fechaAceptacion,
      fechaEstimaPago,
      fechaPago,
      comprobantePago,
      fechaEstimaEntrega,
      fechaEntrega,
      entregaATiempo,
      calidad,
      estatus,
      total,
      metodoPago,
      descuentoAplicado,
      tiempoReposicion,
      tiempoEntrega
    } = req.body;

    // Validación básica
    if (!creadaPor || !fechaCreacion || !estatus || total === undefined) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const insertQuery = `
      INSERT INTO DBADMIN.Ordenes (
        CREADA_POR,
        FECHACREACION,
        FECHAESTIMAACEPTACION,
        FECHAACEPTACION,
        FECHAESTIMAPAGO,
        FECHAPAGO,
        COMPROBANTEPAGO,
        FECHAESTIMAENTREGA,
        FECHAENTREGA,
        ENTREGAATIEMPO,
        CALIDAD,
        ESTATUS,
        TOTAL,
        METODOPAGO,
        DESCUENTOAPLICADO,
        TIEMPOREPOSICION,
        TIEMPOENTREGA
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const params = [
      creadaPor,
      fechaCreacion,
      fechaEstimaAceptacion,
      fechaAceptacion,
      fechaEstimaPago,
      fechaPago,
      comprobantePago,
      fechaEstimaEntrega,
      fechaEntrega,
      entregaATiempo,
      calidad,
      estatus,
      total,
      metodoPago,
      descuentoAplicado,
      tiempoReposicion,
      tiempoEntrega
    ];

    connection.exec(insertQuery, params, async (err, result) => {
      if (err) {
        console.error("Error al insertar pedido:", err);
        return res.status(500).json({ error: "Error al insertar el pedido" });
      }
      res.status(200).json({ message: "Pedido creado exitosamente" });
    });

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deletePedido = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = `DELETE FROM DBADMIN.Ordenes WHERE ID = ?`;
    connection.exec(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar el pedido:", err);
        return res.status(500).json({ error: "Error al eliminar el pedido" });
      }
      res.status(200).json({ message: "Pedido eliminado exitosamente" });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const updatePedido = async (req, res) => {
  const { id } = req.params;
  const {
    creadaPor,
    fechaCreacion,
    fechaEstimaAceptacion,
    fechaAceptacion,
    fechaEstimaPago,
    fechaPago,
    comprobantePago,
    fechaEstimaEntrega,
    fechaEntrega,
    entregaATiempo,
    calidad,
    estatus,
    total,
    metodoPago,
    descuentoAplicado,
    tiempoReposicion,
    tiempoEntrega
  } = req.body;

  try {
    const updateQuery = `
      UPDATE DBADMIN.Ordenes SET
        CREADA_POR = ?, FECHACREACION = ?, FECHAESTIMAACEPTACION = ?,
        FECHAACEPTACION = ?, FECHAESTIMAPAGO = ?, FECHAPAGO = ?, COMPROBANTEPAGO = ?,
        FECHAESTIMAENTREGA = ?, FECHAENTREGA = ?, ENTREGAATIEMPO = ?, CALIDAD = ?,
        ESTATUS = ?, TOTAL = ?, METODOPAGO = ?, DESCUENTOAPLICADO = ?,
        TIEMPOREPOSICION = ?, TIEMPOENTREGA = ?
      WHERE ID = ?
    `;

    const params = [
      creadaPor, fechaCreacion, fechaEstimaAceptacion, fechaAceptacion,
      fechaEstimaPago, fechaPago, comprobantePago, fechaEstimaEntrega,
      fechaEntrega, entregaATiempo, calidad, estatus, total,
      metodoPago, descuentoAplicado, tiempoReposicion, tiempoEntrega, id
    ];

    connection.exec(updateQuery, params, (err, result) => {
      if (err) {
        console.error("Error al actualizar el pedido:", err);
        return res.status(500).json({ error: "Error al actualizar el pedido" });
      }
      res.status(200).json({ message: "Pedido actualizado exitosamente" });
    });

  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getProveedores = async (req, res) => {
  try {
    const query = `SELECT ID, NOMBRE FROM DBADMIN.Proveedores`;
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener proveedores:", err);
        return res.status(500).json({ error: "Error al obtener proveedores" });
      }
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getPedido,
  insertPedido,
  deletePedido,
  updatePedido,
  getProveedores
};