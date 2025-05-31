const { connection } = require("../config/db");

const getPedidosPendientesProveedor = async (req, res) => {
  const { locationId } = req.params;
  
  console.log(`=== DEBUG: Iniciando consulta para locationId: ${locationId} ===`);
  
  if (!locationId) {
    return res.status(400).json({ error: "ID de ubicación requerido" });
  }

  try {
    // Paso 1: Buscar el proveedor
    console.log(`Paso 1: Buscando proveedor en Location2 con ID: ${locationId}`);
    
    const [location] = await new Promise((resolve, reject) => {
      connection.exec(
        'SELECT Nombre AS "Nombre" FROM Location2 WHERE Location_ID = ?', 
        [locationId],
        (err, result) => {
          if (err) {
            console.error("Error en consulta Location2:", err);
            return reject(err);
          }
          console.log("Resultado Location2:", result);
          resolve(result);
        }
      );
    });

    if (!location) {
      console.log("❌ Proveedor no encontrado en Location2");
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    const nombreOrganizacion = location.Nombre;
    console.log(`✅ Proveedor encontrado: "${nombreOrganizacion}" (longitud: ${nombreOrganizacion.length})`);

    // Paso 2: Verificar organizaciones disponibles
    console.log("Paso 2: Verificando organizaciones con pedidos pendientes...");
    
    const organizacionesDisponibles = await new Promise((resolve, reject) => {
      connection.exec(
        'SELECT DISTINCT Organizacion FROM Ordenes2 WHERE Estado = ?',
        ['Pendiente'],
        (err, result) => {
          if (err) return reject(err);
          resolve(result || []);
        }
      );
    });
    
    console.log("Organizaciones con pedidos pendientes:", organizacionesDisponibles.map(org => `"${org.Organizacion}"`));

    // Paso 3: Buscar pedidos (con logging detallado)
    const query = `
      SELECT 
        o.Orden_ID as id,
        o.FechaCreacion as fecha,
        u.Nombre as solicitadoPor,
        u.Correo as correoSolicitante,
        o.Total as total,
        o.Estado as estado,
        o.FechaEstimadaEntrega as fechaEstimada,
        o.Organizacion as organizacion,
        o.TipoOrden as tipoOrden,
        o.DescuentoAplicado as descuento
      FROM Ordenes2 o
      INNER JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID 
      WHERE o.Estado = 'Pendiente' AND o.Organizacion = ?
      ORDER BY o.FechaCreacion DESC
    `;

    console.log(`Paso 3: Ejecutando consulta de pedidos para: "${nombreOrganizacion}"`);
    console.log("Query SQL:", query);
    console.log("Parámetros:", [nombreOrganizacion]);

    connection.exec(query, [nombreOrganizacion], (err, result) => {
      if (err) {
        console.error("❌ Error al obtener pedidos pendientes:", err);
        return res.status(500).json({ error: "Error al obtener pedidos" });
      }
      
      console.log(`📊 Resultado crudo de la consulta:`, result);
      console.log(`📈 Número de pedidos encontrados: ${(result || []).length}`);
      
      // Formatear la respuesta
      const pedidosFormateados = (result || []).map(pedido => ({
        id: pedido.id,
        numero: pedido.id,
        fecha: pedido.fecha,
        solicitadoPor: pedido.solicitadoPor,
        correoSolicitante: pedido.correoSolicitante,
        total: pedido.total,
        estado: pedido.estado,
        fechaEstimada: pedido.fechaEstimada,
        organizacion: pedido.organizacion,
        tipoOrden: pedido.tipoOrden,
        descuento: pedido.descuento || 0
      }));
      
      console.log(`✅ Pedidos formateados para ${nombreOrganizacion}:`, pedidosFormateados.length);
      console.log("=== FIN DEBUG ===");
      
      res.status(200).json(pedidosFormateados);
    });
  } catch (error) {
    console.error("❌ Error general:", error);
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

// CAMBIO IMPORTANTE: Usar el mismo flujo que pedidosController.js
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
      
      if (result[0].Estado !== 'Pendiente') {
        return res.status(400).json({ error: "Solo se pueden aceptar pedidos en estado Pendiente" });
      }

      // CAMBIO: Actualizar estado a 'Aprobado' en lugar de 'Completado'
      // Esto sigue el flujo: Pendiente -> Aprobado -> En Reparto -> Completado
      const updateQuery = `
        UPDATE Ordenes2 SET 
          Estado = 'Aprobado',
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
          nuevoEstado: "Aprobado",
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
  const { motivo } = req.body; // Opcional: razón del rechazo
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté pendiente
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

      // Actualizar estado a Rechazado
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

// NUEVA FUNCIÓN: Para obtener detalles de un pedido específico
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

// NUEVA FUNCIÓN: Para marcar pedido como enviado/en reparto
const enviarPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté aprobado
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
        // Iniciar transacción para actualizar stock y estado
        await new Promise((resolve, reject) => {
          connection.exec('BEGIN', [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Obtener productos del pedido para reducir stock
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

        // Verificar stock suficiente y reducir
        for (const producto of productos) {
          if (producto.StockActual < producto.Cantidad) {
            await new Promise((resolve) => {
              connection.exec('ROLLBACK', [], () => resolve());
            });
            return res.status(400).json({ 
              error: `Stock insuficiente para ${producto.NombreProducto}. Disponible: ${producto.StockActual}, Solicitado: ${producto.Cantidad}` 
            });
          }

          // Reducir stock
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

        // Actualizar estado del pedido
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

        // Confirmar transacción
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
        // Rollback en caso de error
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