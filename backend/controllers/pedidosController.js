const { connection } = require("../config/db");

// Obtener todos los pedidos
const getPedido = async (req, res) => {
  try {
    const query = `
      SELECT
        o.Orden_ID as ID,
        o.Creado_por_ID as CREADA_POR,
        u.Correo as CORREO_CREADOR,
        u.Nombre as CREADO_POR_NOMBRE,
        o.Organizacion,
        o.FechaCreacion as FECHACREACION,
        o.FechaAceptacion as FECHAACEPTACION,
        o.FechaLimitePago as FECHAESTIMAPAGO,
        o.FechaEstimadaEntrega as FECHAESTIMAENTREGA,
        o.FechaEntrega as FECHAENTREGA,
        o.EntregaATiempo as ENTREGAATIEMPO,
        o.Estado as ESTATUS,
        o.Total as TOTAL,
        mp.Nombre as METODOPAGO,
        o.DescuentoAplicado as DESCUENTOAPLICADO,
        o.TiempoReposicion as TIEMPOREPOSICION,
        o.TiempoEntrega as TIEMPOENTREGA,
        o.TipoOrden
      FROM Ordenes2 o
      LEFT JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID
      LEFT JOIN MetodoPago2 mp ON o.MetodoPago_ID = mp.MetodoPago_ID
      ORDER BY o.FechaCreacion DESC
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener los pedidos:", err);
        return res.status(500).json({ error: "Error al obtener los pedidos", detalle: err.message });
      }

      const formatted = (Array.isArray(result) ? result : []).map(pedido => ({
        id: pedido.ID,
        creadaPor: pedido.CORREO_CREADOR,
        creadoPorNombre: pedido.CREADO_POR_NOMBRE,
        organizacion: pedido.Organizacion,
        tipoOrden: pedido.TipoOrden,
        fechaCreacion: pedido.FECHACREACION,
        fechaAceptacion: pedido.FECHAACEPTACION,
        fechaEstimaPago: pedido.FECHAESTIMAPAGO,
        fechaEstimaEntrega: pedido.FECHAESTIMAENTREGA,
        fechaEntrega: pedido.FECHAENTREGA,
        entregaATiempo: pedido.ENTREGAATIEMPO,
        estatus: pedido.ESTATUS,
        total: pedido.TOTAL,
        metodoPago: pedido.METODOPAGO,
        descuentoAplicado: pedido.DESCUENTOAPLICADO,
        tiempoReposicion: pedido.TIEMPOREPOSICION,
        tiempoEntrega: pedido.TIEMPOENTREGA
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
      creadoPorId,
      organizacion,
      productos,
      total,
      metodoPagoId = 1,
      descuentoAplicado = 0,
      tipoOrden = 'Compra'
    } = req.body;

    // Validaciones básicas
    if (!creadoPorId || !organizacion || !productos?.length || total === undefined) {
      return res.status(400).json({ 
        error: "Datos incompletos para crear el pedido",
        detalles: {
          creadoPorId: !creadoPorId ? "Faltante" : "OK",
          organizacion: !organizacion ? "Faltante" : "OK", 
          productos: !productos?.length ? "Faltante o vacío" : "OK",
          total: total === undefined ? "Faltante" : "OK"
        }
      });
    }

    console.log("Datos recibidos para pedido:", {
      creadoPorId,
      organizacion,
      productos: productos.length,
      total,
      metodoPagoId,
      descuentoAplicado,
      tipoOrden
    });

    // Paso 1: Insertar la orden principal
    const insertOrdenQuery = `
      INSERT INTO Ordenes2 (
        Creado_por_ID, 
        TipoOrden,
        Organizacion, 
        FechaCreacion, 
        Estado, 
        Total, 
        MetodoPago_ID, 
        DescuentoAplicado
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'Pendiente', ?, ?, ?)
    `;

    const insertOrdenPromise = new Promise((resolve, reject) => {
      connection.exec(insertOrdenQuery, 
        [creadoPorId, tipoOrden, organizacion, total, metodoPagoId, descuentoAplicado], 
        (err, result) => {
          if (err) {
            console.error("Error al insertar orden:", err);
            reject(err);
          } else {
            // Obtener el ID de la orden recién creada en SAP HANA
            connection.exec("SELECT CURRENT_IDENTITY_VALUE() AS ordenId FROM DUMMY", [], (err2, result2) => {
              if (err2) {
                console.error("Error al obtener ID de orden:", err2);
                reject(err2);
              } else {
                const ordenId = result2[0]?.ORDENID || result2[0]?.ordenId;
                console.log("Orden creada con ID:", ordenId);
                resolve(ordenId);
              }
            });
          }
        }
      );
    });

    const ordenId = await insertOrdenPromise;

    if (!ordenId) {
      throw new Error("No se pudo obtener el ID de la orden creada");
    }

    // Paso 2: Procesar cada producto
    let productosInsertados = 0;
    const erroresProductos = [];

    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      
      try {
        console.log(`Procesando producto ${i + 1}:`, producto);

        // Buscar inventario para este producto y proveedor
        const buscarInventarioQuery = `
          SELECT i.Inventario_ID 
          FROM Inventario2 i
          INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
          INNER JOIN Location2 l ON i.Location_ID = l.Location_ID
          WHERE a.Articulo_ID = ? AND l.Nombre = ?
          LIMIT 1
        `;

        const inventarioResult = await new Promise((resolve, reject) => {
          connection.exec(buscarInventarioQuery, [producto.articuloId, organizacion], (err, result) => {
            if (err) {
              console.error(`Error al buscar inventario para producto ${producto.articuloId}:`, err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        if (!inventarioResult || inventarioResult.length === 0) {
          erroresProductos.push(`No se encontró inventario para el artículo ${producto.articuloId} en ${organizacion}`);
          continue;
        }

        const inventarioId = inventarioResult[0].Inventario_ID;
        console.log(`Inventario encontrado para producto ${producto.articuloId}: ${inventarioId}`);

        // Insertar producto en la orden
        const insertProductoQuery = `
          INSERT INTO OrdenesProductos2 (
            Orden_ID, 
            Inventario_ID, 
            Cantidad, 
            PrecioUnitario
          ) VALUES (?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
          connection.exec(insertProductoQuery, 
            [ordenId, inventarioId, producto.cantidad, producto.precio], 
            (err, result) => {
              if (err) {
                console.error(`Error al insertar producto ${producto.articuloId}:`, err);
                reject(err);
              } else {
                console.log(`Producto ${producto.articuloId} insertado exitosamente`);
                productosInsertados++;
                resolve(result);
              }
            }
          );
        });

      } catch (error) {
        console.error(`Error procesando producto ${producto.articuloId}:`, error);
        erroresProductos.push(`Error en producto ${producto.articuloId}: ${error.message}`);
      }
    }

    // Verificar si se insertaron productos
    if (productosInsertados === 0) {
      // Si no se insertó ningún producto, eliminar la orden
      await new Promise((resolve) => {
        connection.exec("DELETE FROM Ordenes2 WHERE Orden_ID = ?", [ordenId], () => {
          resolve();
        });
      });

      return res.status(400).json({
        error: "No se pudo insertar ningún producto",
        detalles: erroresProductos
      });
    }

    // Respuesta exitosa
    const response = {
      message: "Pedido creado exitosamente",
      ordenId: ordenId,
      total: total,
      productosInsertados,
      totalProductos: productos.length
    };

    if (erroresProductos.length > 0) {
      response.advertencias = erroresProductos;
    }

    console.log("Pedido creado exitosamente:", response);
    res.status(201).json(response);

  } catch (error) {
    console.error("Error general al crear pedido:", error);
    res.status(500).json({ 
      error: "Error al crear el pedido",
      detalle: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Eliminar pedido
const deletePedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    await connection.execSync('BEGIN');
    
    // Verificar que el pedido existe
    const [pedido] = await connection.execSync('SELECT Orden_ID FROM Ordenes2 WHERE Orden_ID = ?', [id]);
    if (!pedido) {
      await connection.execSync('ROLLBACK');
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    // Primero eliminar los productos asociados
    await connection.execSync('DELETE FROM OrdenesProductos2 WHERE Orden_ID = ?', [id]);
    
    // Luego eliminar el pedido
    await connection.execSync('DELETE FROM Ordenes2 WHERE Orden_ID = ?', [id]);
    
    await connection.execSync('COMMIT');
    res.status(200).json({ message: "Pedido eliminado exitosamente" });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar el pedido" });
  }
};

// Actualizar pedido
const updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado, ...datos } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // No permitir cambiar el estado directamente (usar las funciones específicas)
    if (estado) {
      return res.status(400).json({ 
        error: "Use las rutas específicas para cambiar el estado (/aprobar, /entregar)" 
      });
    }

    const campos = [];
    const valores = [];
    
    // Mapeo de campos del frontend a la base de datos
    const campoMap = {
      organizacion: 'Organizacion',
      total: 'Total',
      descuentoAplicado: 'DescuentoAplicado',
      tiempoReposicion: 'TiempoReposicion'
    };
    
    // Construir dinámicamente la consulta
    for (const [key, value] of Object.entries(datos)) {
      if (value !== undefined && value !== null) {
        const campoDb = campoMap[key] || key;
        campos.push(`${campoDb} = ?`);
        valores.push(value);
      }
    }
    
    if (campos.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    const query = `UPDATE Ordenes2 SET ${campos.join(', ')} WHERE Orden_ID = ?`;
    const result = await connection.execSync(query, [...valores, id]);
    
    res.status(200).json({ message: "Pedido actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar el pedido" });
  }
};

// Obtener proveedores (organizaciones únicas que fabrican productos)
const getProveedores = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT
        l.Nombre as NOMBRE,
        COUNT(f.Articulo_ID) as TOTAL_PRODUCTOS
      FROM Location2 l
      INNER JOIN Fabricacion2 f ON l.Location_ID = f.Location_ID
      INNER JOIN Articulo2 a ON f.Articulo_ID = a.Articulo_ID
      WHERE l.Tipo = 'Proveedor' OR l.Tipo = 'Fabrica'
      GROUP BY l.Location_ID, l.Nombre
      ORDER BY l.Nombre
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener proveedores:", err);
        return res.status(500).json({ error: "Error al obtener proveedores", detalle: err.message });
      }
      
      const proveedoresFormateados = (result || []).map(proveedor => ({
        nombre: proveedor.NOMBRE,
        totalProductos: proveedor.TOTAL_PRODUCTOS || 0
      }));
      
      res.status(200).json(proveedoresFormateados);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Obtener productos por proveedor
const getProductosPorProveedor = async (req, res) => {
  const { nombreProveedor } = req.params;
  
  if (!nombreProveedor) {
    return res.status(400).json({ error: "Nombre de proveedor requerido" });
  }

  try {
    const query = `
      SELECT 
        a.Articulo_ID as ID,
        a.Nombre as NOMBRE,
        a.Categoria as CATEGORIA,
        i.StockActual as STOCKACTUAL,
        a.PrecioProveedor as PRECIOCOMPRA,
        a.PrecioVenta as PRECIOVENTA,
        a.Temporada as TEMPORADA,
        i.FechaUltimaImportacion as FECHAULTIMACOMPRA,
        l.Nombre as PROVEEDOR
      FROM Articulo2 a
      INNER JOIN Fabricacion2 f ON a.Articulo_ID = f.Articulo_ID
      INNER JOIN Location2 l ON f.Location_ID = l.Location_ID
      INNER JOIN Inventario2 i ON a.Articulo_ID = i.Articulo_ID AND l.Location_ID = i.Location_ID
      WHERE l.Nombre = ?
      ORDER BY a.Nombre
    `;
    
    connection.exec(query, [decodeURIComponent(nombreProveedor)], (err, result) => {
      if (err) {
        console.error("Error al obtener productos:", err);
        return res.status(500).json({ error: "Error al obtener productos", detalle: err.message });
      }
      
      const productosFormateados = (result || []).map(producto => ({
        id: producto.ID,
        articuloId: producto.ID,
        nombre: producto.NOMBRE,
        categoria: producto.CATEGORIA,
        stockActual: producto.STOCKACTUAL,
        precioCompra: producto.PRECIOCOMPRA,
        precioVenta: producto.PRECIOVENTA,
        temporada: producto.TEMPORADA,
        fechaUltimaCompra: producto.FECHAULTIMACOMPRA,
        proveedor: producto.PROVEEDOR,
        precio: producto.PRECIOCOMPRA
      }));
      
      res.status(200).json(productosFormateados);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Aprobar pedido (para proveedores)
const aprobarPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté pendiente
    const [pedido] = await connection.execSync(`
      SELECT Estado, Organizacion, Creado_por_ID FROM Ordenes2 WHERE Orden_ID = ?
    `, [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estado !== 'Pendiente') {
      return res.status(400).json({ error: "Solo se pueden aprobar pedidos en estado Pendiente" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE Ordenes2 SET 
        Estado = 'Aprobado',
        FechaAceptacion = CURRENT_DATE,
        FechaEstimadaEntrega = ADD_DAYS(CURRENT_DATE, 7)
      WHERE Orden_ID = ?
    `, [id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ message: "Pedido aprobado exitosamente" });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al aprobar pedido:", error);
    res.status(500).json({ error: "Error al aprobar el pedido" });
  }
};

// Marcar pedido como entregado/enviado (para proveedores)
const entregarPedido = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté aprobado
    const [pedido] = await connection.execSync(`
      SELECT Estado, Organizacion FROM Ordenes2 WHERE Orden_ID = ?
    `, [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estado !== 'Aprobado') {
      return res.status(400).json({ error: "Solo se pueden enviar pedidos en estado Aprobado" });
    }

    await connection.execSync('BEGIN');
    
    // Obtener productos del pedido y reducir stock del proveedor
    const productos = await connection.execSync(`
      SELECT 
        op.Inventario_ID,
        op.Cantidad,
        i.Location_ID,
        i.Articulo_ID
      FROM OrdenesProductos2 op
      INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
      WHERE op.Orden_ID = ?
    `, [id]);

    // Reducir stock en el inventario del proveedor
    for (const producto of productos) {
      await connection.execSync(`
        UPDATE Inventario2 SET 
          StockActual = StockActual - ?,
          Exportacion = Exportacion + ?,
          FechaUltimaExportacion = CURRENT_DATE
        WHERE Inventario_ID = ?
      `, [producto.Cantidad, producto.Cantidad, producto.Inventario_ID]);
    }
    
    // Actualizar estado del pedido
    await connection.execSync(`
      UPDATE Ordenes2 SET 
        Estado = 'En Reparto',
        FechaEntrega = CURRENT_DATE,
        EntregaATiempo = CASE 
          WHEN FechaEstimadaEntrega >= CURRENT_DATE THEN 1 
          ELSE 0 
        END,
        TiempoEntrega = DAYS_BETWEEN(FechaAceptacion, CURRENT_DATE)
      WHERE Orden_ID = ?
    `, [id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ 
      message: "Pedido marcado como enviado y stock actualizado",
      totalProductos: productos.length
    });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al marcar pedido como entregado:", error);
    res.status(500).json({ error: "Error al actualizar el pedido" });
  }
};

// Obtener pedidos de un proveedor específico
const getPedidosProveedor = async (req, res) => {
  const { correo } = req.params;
  
  if (!correo) {
    return res.status(400).json({ error: "Correo del proveedor requerido" });
  }

  try {
    connection.exec(`
      SELECT 
        o.Orden_ID as ID,
        o.Organizacion,
        o.FechaCreacion,
        o.FechaAceptacion,
        o.FechaEstimadaEntrega,
        o.FechaEntrega,
        o.Estado,
        o.Total,
        u.Nombre as SolicitadoPor
      FROM Ordenes2 o
      INNER JOIN Usuario2 u ON o.Creado_por_ID = u.Usuario_ID
      WHERE o.Organizacion = (
        SELECT l.Nombre 
        FROM Location2 l 
        INNER JOIN Usuario2 u2 ON l.Location_ID = u2.Location_ID 
        WHERE u2.Correo = ?
      )
      ORDER BY o.FechaCreacion DESC
    `, [correo], (err, result) => {
      if (err) {
        console.error("Error al obtener pedidos del proveedor:", err);
        return res.status(500).json({ error: "Error al obtener pedidos" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error al obtener pedidos del proveedor:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// Obtener detalles de un pedido
const getDetallesPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    connection.exec(`
      SELECT 
        a.Articulo_ID as ID,
        a.Nombre as NOMBRE,
        a.Categoria as CATEGORIA,
        op.Cantidad as CANTIDAD,
        op.PrecioUnitario as PRECIOUNITARIO,
        (op.Cantidad * op.PrecioUnitario) as TOTAL
      FROM OrdenesProductos2 op
      INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
      INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
      WHERE op.Orden_ID = ?
      ORDER BY a.Nombre
    `, [id], (err, result) => {
      if (err) {
        console.error("Error al obtener detalles del pedido:", err);
        return res.status(500).json({ error: "Error al obtener detalles" });
      }
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error al obtener detalles del pedido:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};

// Recibir pedido y agregar al inventario (para admin)
const enviarAInventario = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté en reparto
    const [pedido] = await connection.execSync(`
      SELECT Estado FROM Ordenes2 WHERE Orden_ID = ?
    `, [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estado !== 'En Reparto') {
      return res.status(400).json({ 
        error: "Solo se pueden recibir pedidos en estado En Reparto" 
      });
    }

    await connection.execSync('BEGIN');
    
    // Obtener productos del pedido
    const productos = await connection.execSync(`
      SELECT 
        op.Cantidad,
        op.PrecioUnitario,
        i.Articulo_ID,
        a.Nombre as ArticuloNombre
      FROM OrdenesProductos2 op
      INNER JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID
      INNER JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID
      WHERE op.Orden_ID = ?
    `, [id]);

    if (!productos || productos.length === 0) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ error: "No se encontraron productos en el pedido" });
    }

    // Buscar nuestro location (asumiendo que tenemos un location principal)
    const [nuestroLocation] = await connection.execSync(`
      SELECT Location_ID FROM Location2 
      WHERE Tipo = 'Almacen' OR Tipo = 'Principal' 
      LIMIT 1
    `);

    if (!nuestroLocation) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ error: "No se encontró location principal para recibir inventario" });
    }

    // Actualizar o crear inventario para cada producto en nuestro almacén
    for (const producto of productos) {
      // Verificar si ya existe inventario para este producto en nuestro location
      const [inventarioExistente] = await connection.execSync(`
        SELECT Inventario_ID, StockActual FROM Inventario2 
        WHERE Articulo_ID = ? AND Location_ID = ?
      `, [producto.Articulo_ID, nuestroLocation.Location_ID]);

      if (inventarioExistente) {
        // Actualizar inventario existente
        await connection.execSync(`
          UPDATE Inventario2 SET 
            StockActual = StockActual + ?,
            Importacion = Importacion + ?,
            FechaUltimaImportacion = CURRENT_DATE
          WHERE Inventario_ID = ?
        `, [producto.Cantidad, producto.Cantidad, inventarioExistente.Inventario_ID]);
      } else {
        // Crear nuevo registro de inventario
        await connection.execSync(`
          INSERT INTO Inventario2 (
            Articulo_ID, 
            Location_ID, 
            StockActual, 
            Importacion, 
            StockMinimo, 
            StockRecomendado, 
            FechaUltimaImportacion
          ) VALUES (?, ?, ?, ?, 10, 50, CURRENT_DATE)
        `, [producto.Articulo_ID, nuestroLocation.Location_ID, producto.Cantidad, producto.Cantidad]);
      }
    }

    // Marcar pedido como completado
    await connection.execSync(`
      UPDATE Ordenes2 SET 
        Estado = 'Completado'
      WHERE Orden_ID = ?
    `, [id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ 
      message: "Productos agregados al inventario exitosamente",
      totalProductos: productos.length,
      pedidoId: id
    });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al recibir pedido:", error);
    res.status(500).json({ error: "Error al actualizar inventario" });
  }
};

// Mantener compatibilidad con funciones existentes
const getProveedoresInventario = async (req, res) => {
  return getProveedores(req, res);
};

const getProductosInventarioPorProveedor = async (req, res) => {
  return getProductosPorProveedor(req, res);
};

module.exports = {
  getPedido,
  insertPedido,
  deletePedido,
  updatePedido,
  getProveedores,
  getProductosPorProveedor,
  aprobarPedido,
  entregarPedido,
  getPedidosProveedor,
  getDetallesPedido,
  enviarAInventario,
  getProveedoresInventario,
  getProductosInventarioPorProveedor
};