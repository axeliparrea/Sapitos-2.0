const { connection } = require("../config/db");

const getPedidosPendientesProveedor = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.Orden_ID as id,
        o.FechaCreacion as fecha,
        u.Nombre as solicitadoPor,
        u.Correo as correoSolicitante,
        o.Total as total,
        o.Estado as estado,
        o.FechaEstimadaEntrega as fechaEstimada,
        o.TipoOrden as tipoOrden,
        o.DescuentoAplicado as descuento
      FROM Ordenes2 o
      INNER JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID 
      WHERE o.Estado IN ('Pendiente', 'Aprobado', 'En Reparto') 
      ORDER BY o.FechaCreacion DESC
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener pedidos pendientes:", err);
        return res.status(500).json({ error: "Error al obtener pedidos" });
      }

      const pedidosFormateados = (result || []).map(pedido => ({
        id: pedido.ID,
        numero: pedido.ID,
        fecha: pedido.FECHA,
        solicitadoPor: pedido.SOLICITADOPOR,
        correoSolicitante: pedido.CORREOSOLICITANTE,
        total: pedido.TOTAL,
        estado: pedido.ESTADO,
        fechaEstimada: pedido.FECHAESTIMADA,
        tipoOrden: pedido.TIPOORDEN,
        descuento: pedido.DESCUENTO || 0
      }));

      res.status(200).json(pedidosFormateados);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const getInventarioProveedor = async (req, res) => {
  const { locationId } = req.params;
  
  if (!locationId) {
    return res.status(400).json({ error: "ID de ubicación requerido" });
  }
  
  try {
    const query = `
      SELECT 
        i.Inventario_ID as id,
        a.Articulo_ID as articuloId,
        a.Nombre as nombre,
        a.Categoria as categoria,
        i.StockActual as stockActual,
        i.StockMinimo as stockMinimo,
        a.PrecioProveedor as precioProveedor,
        a.PrecioVenta as precioVenta,
        i.FechaUltimaImportacion as ultimaCompra,
        i.MargenGanancia as margen
      FROM Inventario2 i
      INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
      WHERE i.Location_ID = ?
      ORDER BY a.Nombre
    `;

    connection.exec(query, [locationId], (err, result) => {
      if (err) {
        console.error("Error al obtener inventario:", err);
        return res.status(500).json({ error: "Error al obtener inventario" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


const aceptarPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté pendiente
    const checkQuery = 'SELECT Estado, Organizacion FROM Ordenes2 WHERE Orden_ID = ?';
    
    connection.exec(checkQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al verificar pedido:", err);
        return res.status(500).json({ error: "Error al verificar el pedido" });
      }
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      console.log("Estado actual del pedido:", result[0].ESTADO);
      if (result[0].ESTADO !== 'Pendiente') {
        return res.status(400).json({ error: "Solo se pueden aceptar pedidos en estado Pendiente" });
      }

      // CAMBIO: Actualizar estado a 'En Reparto' en lugar de 'Aprobado'
      // Esto sigue el flujo: Pendiente -> Aprobado -> En Reparto -> Completado
      const updateQuery = `
        UPDATE Ordenes2 SET 
          Estado = 'En Reparto',
          FechaAceptacion = CURRENT_DATE,
          FechaEstimadaEntrega = ADD_DAYS(CURRENT_DATE, 7)
        WHERE Orden_ID = ?
      `;
      
      connection.exec(updateQuery, [id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error al aceptar pedido:", updateErr);
          return res.status(500).json({ error: "Error al aceptar el pedido" });
        }
        
        res.status(200).json({ 
          message: "Pedido aceptado exitosamente",
          nuevoEstado: "En Reparto",
          fechaEstimadaEntrega: "7 días desde hoy"
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const rechazarPedido = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body; 
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    const checkQuery = 'SELECT Estado FROM Ordenes2 WHERE Orden_ID = ?';
    
    connection.exec(checkQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al verificar pedido:", err);
        return res.status(500).json({ error: "Error al verificar el pedido" });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      
      if (result[0].Estado !== 'Pendiente') {
        return res.status(400).json({ error: "Solo se pueden rechazar pedidos en estado Pendiente" });
      }

      const updateQuery = `
        UPDATE Ordenes2 SET 
          Estado = 'Rechazado',
          FechaAceptacion = CURRENT_DATE
        WHERE Orden_ID = ?
      `;
      
      connection.exec(updateQuery, [id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error al rechazar pedido:", updateErr);
          return res.status(500).json({ error: "Error al rechazar el pedido" });
        }
        
        res.status(200).json({ 
          message: "Pedido rechazado exitosamente",
          motivo: motivo || "Sin motivo especificado"
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


const getDetallePedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    const query = `
      SELECT 
        a.Articulo_ID as articuloId,
        a.Nombre as nombre,
        a.Categoria as categoria,
        op.Cantidad as cantidad,
        op.PrecioUnitario as precioUnitario,
        (op.Cantidad * op.PrecioUnitario) as subtotal,
        i.StockActual as stockDisponible
      FROM OrdenesProductos2 op
      INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
      INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
      WHERE op.Orden_ID = ?
      ORDER BY a.Nombre
    `;

    connection.exec(query, [id], (err, result) => {
      if (err) {
        console.error("Error al obtener detalles del pedido:", err);
        return res.status(500).json({ error: "Error al obtener detalles" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};


const enviarPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    const checkQuery = `
      SELECT Estado, Organizacion FROM Ordenes2 
      WHERE Orden_ID = ?
    `;
    
    connection.exec(checkQuery, [id], async (err, result) => {
      if (err) {
        console.error("Error al verificar pedido:", err);
        return res.status(500).json({ error: "Error al verificar el pedido" });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      
      if (result[0].Estado !== 'Aprobado') {
        return res.status(400).json({ 
          error: "Solo se pueden enviar pedidos en estado Aprobado" 
        });
      }

      try {
        await new Promise((resolve, reject) => {
          connection.exec('BEGIN', [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        const productos = await new Promise((resolve, reject) => {
          connection.exec(`
            SELECT 
              op.Inventario_ID,
              op.Cantidad,
              i.StockActual,
              a.Nombre as NombreProducto
            FROM OrdenesProductos2 op
            INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
            INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
            WHERE op.Orden_ID = ?
          `, [id], (err, result) => {
            if (err) reject(err);
            else resolve(result || []);
          });
        });

        for (const producto of productos) {
          if (producto.StockActual < producto.Cantidad) {
            await new Promise((resolve) => {
              connection.exec('ROLLBACK', [], () => resolve());
            });
            return res.status(400).json({ 
              error: `Stock insuficiente para ${producto.NombreProducto}. Disponible: ${producto.StockActual}, Solicitado: ${producto.Cantidad}` 
            });
          }
          await new Promise((resolve, reject) => {
            connection.exec(`
              UPDATE Inventario2 SET 
                StockActual = StockActual - ?,
                Exportacion = COALESCE(Exportacion, 0) + ?,
                FechaUltimaExportacion = CURRENT_DATE
              WHERE Inventario_ID = ?
            `, [producto.Cantidad, producto.Cantidad, producto.Inventario_ID], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        await new Promise((resolve, reject) => {
          connection.exec(`
            UPDATE Ordenes2 SET 
              Estado = 'En Reparto',
              FechaEntrega = CURRENT_DATE,
              EntregaATiempo = CASE 
                WHEN FechaEstimadaEntrega >= CURRENT_DATE THEN 1 
                ELSE 0 
              END,
              TiempoEntrega = DAYS_BETWEEN(FechaAceptacion, CURRENT_DATE)
            WHERE Orden_ID = ?
          `, [id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        await new Promise((resolve, reject) => {
          connection.exec('COMMIT', [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        res.status(200).json({ 
          message: "Pedido enviado exitosamente y stock actualizado",
          productosEnviados: productos.length,
          nuevoEstado: "En Reparto"
        });

      } catch (transactionError) {
        await new Promise((resolve) => {
          connection.exec('ROLLBACK', [], () => resolve());
        });
        
        console.error("Error en transacción:", transactionError);
        res.status(500).json({ error: "Error al procesar el envío" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getPedidosPendientesProveedor,
  getInventarioProveedor,
  aceptarPedido,
  rechazarPedido,
  getDetallePedido,
  enviarPedido
};