const { connection } = require("../config/db");
const jwt = require("jsonwebtoken");

const getPedido = async (req, res) => {
    try {
      const query = `
        SELECT
          ID,
          CREADA_POR,
          TIPOORDEN,
          ORGANIZACION,
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
          TOTAL
        FROM DBADMIN.Ordenes
      `;
  
      connection.exec(query, [], async (err, result) => {
        if (err) {
          console.error("Error al obtener los pedidos", err);
          return res.status(500).json({ error: "Error al obtener los pedidos" });
        }
  
        const formatted = result.map(pedido => ({
          id: pedido.ID,
          creadaPor: pedido.CREADA_POR,
          tipoOrden: pedido.TIPOORDEN,
          organizacion: pedido.ORGANIZACION,
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
          total: pedido.TOTAL
        }));
  
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
            id,
            creadaPor,
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
            total
        } = req.body;
        
        // Validación
        if (!creadaPor || !tipoOrden || !organizacion || !fechaCreacion || !estatus) {
            return res.status(400).json({ error: "Datos incompletos, verifique los campos obligatorios" });
        }

        const insertQuery = `
            INSERT INTO DBADMIN.Ordenes (ID, CREADA_POR, TIPOORDEN, ORGANIZACION, FECHACREACION, FECHAESTIMAACEPTACION, FECHAACEPTACION, FECHAESTIMAPAGO, FECHAPAGO, COMPROBANTEPAGO, FECHAESTIMAENTREGA, FECHAENTREGA, ENTREGAATIEMPO, CALIDAD, ESTATUS, TOTAL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const params = [
            id,
            creadaPor,
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
            total
        ];

        connection.exec(insertQuery, params, async (err, result) => {
            if (err) {
                console.error("Error al insertar pedido:", err);
                return res.status(500).json({ error: "Error al insertar el pedido" });
            }
            res.status(200).json({ message: "Pedido creado exitosamente", id: id });
        });

    } catch (error) {
        console.error("Error general:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};


module.exports = {
  getPedido,
  insertPedido
}
