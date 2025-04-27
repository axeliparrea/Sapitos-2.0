const { connection } = require("../config/db");
const jwt = require("jsonwebtoken");

const getOrden = async (req, res) => {
    try {
      const query = `
        SELECT 
          ID,
          Creada_por,
          TipoOrden,
          Organizacion,
          FechaCreacion,
          FechaEstimaAceptacion,
          FechaAceptacion,
          FechaEstimaPago,
          FechaPago,
          ComprobantePago,
          FechaEstimaEntrega,
          FechaEntrega,
          EntregaATiempo,
          Calidad,
          Estatus,
          Total,
          MetodoPago,
          DescuentoAplicado,
          TiempoReposicion,
          TiempoEntrega
        FROM DBADMIN.Ordenes
      `;
  
      connection.exec(query, [], async (err, result) => {
        if (err) {
          console.error("Error al obtener las órdenes", err);
          return res.status(500).json({ error: "Error al obtener las órdenes" });
        }
  
        const formatted = result.map(orden => ({
          id: orden.ID,
          creada_por: orden.CREADA_POR,
          tipoOrden: orden.TIPOORDEN,
          organizacion: orden.ORGANIZACION,
          fechaCreacion: orden.FECHACREACION,
          fechaEstimaAceptacion: orden.FECHAESTIMAACEPTACION,
          fechaAceptacion: orden.FECHAACEPTACION,
          fechaEstimaPago: orden.FECHAESTIMAPAGO,
          fechaPago: orden.FECHAPAGO,
          comprobantePago: orden.COMPROBANTEPAGO,
          fechaEstimaEntrega: orden.FECHAESTIMAENTREGA,
          fechaEntrega: orden.FECHAENTREGA,
          entregaATiempo: orden.ENTREGAATIEMPO,
          calidad: orden.CALIDAD,
          estatus: orden.ESTATUS,
          total: orden.TOTAL,
          metodoPago: orden.METODOPAGO,
          descuentoAplicado: orden.DESCUENTOAPLICADO,
          tiempoReposicion: orden.TIEMPOREPOSICION,
          tiempoEntrega: orden.TIEMPOENTREGA,
        }));
  
        res.status(200).json(formatted);
      });
    } catch (error) {
      console.error("Error general:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };
  

  const insertOrden = async (req, res) => {
    const {
      creada_por,
      tipoOrden,
      organizacion,
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
      const insertQuery = `
        INSERT INTO DBADMIN.Ordenes (
          Creada_por,
          TipoOrden,
          Organizacion,
          FechaCreacion,
          FechaEstimaAceptacion,
          FechaAceptacion,
          FechaEstimaPago,
          FechaPago,
          ComprobantePago,
          FechaEstimaEntrega,
          FechaEntrega,
          EntregaATiempo,
          Calidad,
          Estatus,
          Total,
          MetodoPago,
          DescuentoAplicado,
          TiempoReposicion,
          TiempoEntrega
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const params = [
        creada_por,
        tipoOrden,
        organizacion,
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
  
      connection.prepare(insertQuery, (err, statement) => {
        if (err) {
          console.error("Error al preparar la consulta de inserción:", err);
          return res.status(500).json({ error: "Error al preparar la consulta" });
        }
  
        statement.exec(params, (err, result) => {
          if (err) {
            console.error("Error al ejecutar la consulta de inserción:", err);
            return res.status(500).json({ error: "Error al insertar la orden" });
          }
  
          res.status(201).json({ message: "Orden insertada correctamente" });
        });
      });
    } catch (error) {
      console.error("Error general:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };

const deleteOrden = async (req, res) => {
    const id = req.params.id;
  
    try {
      const checkQuery = `SELECT ID FROM DBADMIN.Ordenes WHERE ID = ?`;
      
      connection.exec(checkQuery, [id], (err, result) => {
        if (err) {
          console.error("Error al verificar la orden:", err);
          return res.status(500).json({ error: "Error al verificar la orden" });
        }
  
        if (result.length === 0) {
          return res.status(404).json({ error: "Orden no encontrada" });
        }
  
        const deleteQuery = `DELETE FROM DBADMIN.Ordenes WHERE ID = ?`;
  
        connection.exec(deleteQuery, [id], (err) => {
          if (err) {
            console.error("Error al eliminar la orden:", err);
            return res.status(500).json({ error: "Error al eliminar la orden" });
          }
  
          res.status(200).json({ message: "Orden eliminada exitosamente" });
        });
      });
    } catch (error) {
      console.error("Error general:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  };
  

  module.exports = {
    getOrden,
    insertOrden,
    deleteOrden
  };
  