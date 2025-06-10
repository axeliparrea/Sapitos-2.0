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
    creado_por_id,
    modificado_por_id,
    tipoOrden,
    metodopago_id,
    productos = []
  } = req.body;

  const fechaCreacion = new Date().toISOString().split("T")[0];
  const estado = "Pendiente";

  try {
    const insertOrdenQuery = `
      INSERT INTO DBADMIN.Ordenes2 (
        CREADO_POR_ID,
        MODIFICADO_POR_ID,
        TIPOORDEN,
        ORGANIZACION,
        FECHACREACION,
        ESTADO,
        METODOPAGO_ID
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const ordenParams = [
      creado_por_id,
      modificado_por_id,
      tipoOrden,
      modificado_por_id, // ORGANIZACION lo igualamos a MODIFICADO_POR_ID
      fechaCreacion,
      estado,
      metodopago_id
    ];

    connection.prepare(insertOrdenQuery, (err, statement) => {
      if (err) {
        console.error("❌ Error al preparar la inserción de orden:", err);
        return res.status(500).json({ error: "Error preparando la orden" });
      }

      statement.exec(ordenParams, (err) => {
        if (err) {
          console.error("❌ Error al insertar orden:", err);
          return res.status(500).json({ error: "Error al insertar la orden" });
        }

        // Obtener el último ID insertado
        const getLastIdQuery = `SELECT MAX(ORDEN_ID) AS LASTID FROM DBADMIN.Ordenes2`;
        connection.exec(getLastIdQuery, [], (err, result) => {
          if (err || !result || result.length === 0) {
            console.error("❌ Error al obtener el ID de la orden:", err);
            return res.status(500).json({ error: "No se pudo obtener el ID de la orden" });
          }

          const ordenId = result[0].LASTID;

          if (productos.length === 0) {
            return res.status(201).json({ message: "Orden creada sin productos", ordenId });
          }

          let insertados = 0;
          let errores = [];

          productos.forEach(({ inventario_id, cantidad }) => {
            const insertProductoQuery = `
              INSERT INTO DBADMIN.OrdenesProductos2 (ORDEN_ID, INVENTARIO_ID, CANTIDAD, PRECIOUNITARIO)
              VALUES (?, ?, ?, 0)
            `;

            connection.prepare(insertProductoQuery, (err, prodStatement) => {
              if (err) {
                errores.push(`Error preparando producto: ${err.message}`);
                insertados++;
                return;
              }

              prodStatement.exec([ordenId, inventario_id, cantidad], (err) => {
                if (err) {
                  errores.push(`Error insertando producto ${inventario_id}: ${err.message}`);
                }
                insertados++;

                if (insertados === productos.length) {
                  if (errores.length > 0) {
                    return res.status(201).json({
                      message: "Orden creada con errores en productos",
                      ordenId,
                      errores
                    });
                  } else {
                    return res.status(201).json({
                      message: "Orden y productos creados exitosamente",
                      ordenId
                    });
                  }
                }
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("💥 Error general al insertar orden:", error);
    res.status(500).json({ error: "Error del servidor al insertar la orden" });
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

const getOrdenesPorLocation = async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = `
      SELECT 
        Orden_ID AS ORDEN_ID,
        TipoOrden AS TIPOORDEN,
        Organizacion AS ORGANIZACION,
        FechaCreacion AS FECHACREACION,
        Estado AS ESTADO,
        Total AS TOTAL
      FROM DBADMIN.Ordenes2
      WHERE Modificado_por_ID = ?
    `;

    connection.exec(query, [locationId], (err, result) => {
      if (err) {
        console.error("🔥 Error al obtener órdenes por Modificado_por_ID:", err);
        return res.status(500).json({ error: "Error al obtener órdenes" });
      }

      res.status(200).json(result);
    });
  } catch (error) {
    console.error("💥 Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getOrdenesPorCreador = async (req, res) => {
  const { creadorId } = req.params;

  try {
    const query = `
      SELECT 
        Orden_ID AS ORDEN_ID,
        TipoOrden AS TIPOORDEN,
        Organizacion AS ORGANIZACION,
        FechaCreacion AS FECHACREACION,
        Estado AS ESTADO,
        Total AS TOTAL
      FROM DBADMIN.Ordenes2
      WHERE Creado_por_ID = ?
    `;

    connection.exec(query, [creadorId], (err, result) => {
      if (err) {
        console.error("🔥 Error al obtener órdenes por Creado_por_ID:", err);
        return res.status(500).json({ error: "Error al obtener órdenes" });
      }

      res.status(200).json(result);
    });
  } catch (error) {
    console.error("💥 Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};



module.exports = {
  getOrden,
  insertOrden,
  deleteOrden,
  getOrdenesPorLocation,
  getOrdenesPorCreador
};
