const { connection } = require("../config/db");

// Obtener todos los pedidos
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
      FROM Ordenes
      ORDER BY FECHACREACION DESC
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener los pedidos", err);
        return res.status(500).json({ error: "Error al obtener los pedidos" });
      }

      const formatted = (Array.isArray(result) ? result : []).map(pedido => ({
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

      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Crear nuevo pedido
const insertPedido = async (req, res) => {
  try {
    const { 
      creadaPor, 
      proveedorId, 
      productos, 
      total, 
      metodoPago = 'Transferencia', 
      descuentoAplicado = 0,
      fecha 
    } = req.body;

    // Validaciones
    if (!creadaPor || !productos?.length || total === undefined) {
      return res.status(400).json({ error: "Datos incompletos para crear el pedido" });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe incluir al menos un producto" });
    }

    // Validar que todos los productos tengan los datos necesarios
    for (const producto of productos) {
      if (!producto.id || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ 
          error: "Todos los productos deben tener ID y cantidad válida" 
        });
      }
    }

    await connection.execSync('BEGIN');

    try {
      // Insertar encabezado del pedido
      const pedidoResult = await connection.execSync(`
        INSERT INTO Ordenes (
          Creada_por, FechaCreacion, Estatus, Total, MetodoPago, DescuentoAplicado
        ) VALUES (?, COALESCE(?, CURRENT_DATE), 'Pendiente', ?, ?, ?)
        RETURNING ID
      `, [creadaPor, fecha, total, metodoPago, descuentoAplicado]);

      const pedidoId = pedidoResult[0].ID;

      // Insertar productos del pedido
      for (const producto of productos) {
        const precioUnitario = producto.precio || producto.precioCompra || producto.PrecioCompra || 0;
        
        await connection.execSync(`
          INSERT INTO OrdenesProductos (OrdenID, ProductoID, Cantidad, PrecioUnitario)
          VALUES (?, ?, ?, ?)
        `, [pedidoId, producto.id, producto.cantidad, precioUnitario]);

        // Registrar en historial de precios
        await connection.execSync(`
          INSERT INTO HistorialPreciosProductos (ProductoID, PrecioCompra, FechaCambio, MotivoCambio)
          VALUES (?, ?, CURRENT_DATE, 'Pedido #' || ?)
        `, [producto.id, precioUnitario, pedidoId]);
      }

      await connection.execSync('COMMIT');
      
      res.status(201).json({ 
        message: "Pedido creado exitosamente",
        id: pedidoId,
        pedidoId: pedidoId,
        totalProductos: productos.length,
        total: total
      });

    } catch (innerError) {
      await connection.execSync('ROLLBACK');
      throw innerError;
    }

  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ 
      error: "Error al crear el pedido", 
      detalle: error.message 
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
    const [pedido] = await connection.execSync('SELECT ID FROM Ordenes WHERE ID = ?', [id]);
    if (!pedido) {
      await connection.execSync('ROLLBACK');
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    // Primero eliminar los productos asociados
    await connection.execSync('DELETE FROM OrdenesProductos WHERE OrdenID = ?', [id]);
    
    // Luego eliminar el pedido
    await connection.execSync('DELETE FROM Ordenes WHERE ID = ?', [id]);
    
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
  const { estatus, ...datos } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // No permitir cambiar el estado directamente (usar las funciones específicas)
    if (estatus) {
      return res.status(400).json({ 
        error: "Use las rutas específicas para cambiar el estado (/aprobar, /entregar)" 
      });
    }

    const campos = [];
    const valores = [];
    
    // Construir dinámicamente la consulta
    for (const [key, value] of Object.entries(datos)) {
      if (value !== undefined && value !== null) {
        campos.push(`${key} = ?`);
        valores.push(value);
      }
    }
    
    if (campos.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    const query = `UPDATE Ordenes SET ${campos.join(', ')} WHERE ID = ?`;
    const result = await connection.execSync(query, [...valores, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    res.status(200).json({ message: "Pedido actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar el pedido" });
  }
};

// Obtener proveedores
const getProveedores = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.ID,
        p.Nombre,
        p.Contacto,
        p.Telefono,
        p.Email,
        u.Correo as UsuarioAsociado
      FROM PROVEEDORES p
      LEFT JOIN Usuarios u ON p.UsuarioID = u.Correo
      WHERE u.Rol = 'proveedor' OR u.Rol IS NULL
      ORDER BY p.Nombre
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener proveedores:", err);
        return res.status(500).json({ error: "Error al obtener proveedores" });
      }
      
      const proveedoresFormateados = (result || []).map(proveedor => ({
        ID: proveedor.ID,
        Nombre: proveedor.Nombre,
        Contacto: proveedor.Contacto,
        Telefono: proveedor.Telefono,
        Email: proveedor.Email,
        UsuarioAsociado: proveedor.UsuarioAsociado
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
  const { proveedorId } = req.params;
  
  if (!proveedorId) {
    return res.status(400).json({ error: "ID de proveedor requerido" });
  }

  try {
    const query = `
      SELECT 
        p.ID,
        p.Nombre,
        p.Categoria,
        p.StockActual,
        p.PrecioCompra,
        p.PrecioVenta,
        p.Temporada,
        p.FechaUltimaCompra
      FROM Productos p
      WHERE p.Proveedor = ?
      ORDER BY p.Nombre
    `;
    
    connection.exec(query, [proveedorId], (err, result) => {
      if (err) {
        console.error("Error al obtener productos:", err);
        return res.status(500).json({ error: "Error al obtener productos" });
      }
      
      const productosFormateados = (result || []).map(producto => ({
        id: producto.ID,
        ID: producto.ID,
        nombre: producto.Nombre,
        Nombre: producto.Nombre,
        categoria: producto.Categoria,
        stockActual: producto.StockActual,
        StockActual: producto.StockActual,
        precioCompra: producto.PrecioCompra,
        PrecioCompra: producto.PrecioCompra,
        precioVenta: producto.PrecioVenta,
        temporada: producto.Temporada,
        fechaUltimaCompra: producto.FechaUltimaCompra
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
    const [pedido] = await connection.execSync('SELECT Estatus, Creada_por FROM Ordenes WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estatus !== 'Pendiente') {
      return res.status(400).json({ error: "Solo se pueden aprobar pedidos en estado Pendiente" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE Ordenes SET 
        Estatus = 'Aprobado',
        FechaAceptacion = CURRENT_DATE,
        FechaEstimaEntrega = DATE(CURRENT_DATE, '+7 days')
      WHERE ID = ?
    `, [id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ message: "Pedido aprobado exitosamente" });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al aprobar pedido:", error);
    res.status(500).json({ error: "Error al aprobar el pedido" });
  }
};

// Marcar pedido como entregado
const entregarPedido = async (req, res) => {
  const { id } = req.params;
  const { calidad = 5, entregaATiempo = true } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Validar calidad (1-5)
    if (calidad < 1 || calidad > 5) {
      return res.status(400).json({ error: "La calidad debe ser entre 1 y 5" });
    }

    // Verificar que el pedido esté aprobado
    const [pedido] = await connection.execSync('SELECT Estatus FROM Ordenes WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estatus !== 'Aprobado') {
      return res.status(400).json({ error: "Solo se pueden entregar pedidos en estado Aprobado" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE Ordenes SET 
        Estatus = 'Completado',
        FechaEntrega = CURRENT_DATE,
        Calidad = ?,
        EntregaATiempo = ?,
        TiempoEntrega = JULIANDAY(CURRENT_DATE) - JULIANDAY(FechaAceptacion)
      WHERE ID = ?
    `, [calidad, entregaATiempo, id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ message: "Pedido marcado como entregado" });
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
      SELECT * FROM Ordenes 
      WHERE Creada_por = ?
      ORDER BY FechaCreacion DESC
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
        p.ID,
        p.Nombre,
        p.Categoria,
        op.Cantidad,
        op.PrecioUnitario,
        (op.Cantidad * op.PrecioUnitario) as Total
      FROM OrdenesProductos op
      JOIN Productos p ON op.ProductoID = p.ID
      WHERE op.OrdenID = ?
      ORDER BY p.Nombre
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

// Enviar pedido a inventario
const enviarAInventario = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido inválido" });
  }

  try {
    // Verificar que el pedido esté completado
    const [pedido] = await connection.execSync('SELECT Estatus FROM Ordenes WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estatus !== 'Completado') {
      return res.status(400).json({ 
        error: "Solo se pueden enviar al inventario pedidos en estado Completado" 
      });
    }

    await connection.execSync('BEGIN');
    
    // Obtener productos del pedido
    const productos = await connection.execSync(`
      SELECT ProductoID, Cantidad, PrecioUnitario 
      FROM OrdenesProductos 
      WHERE OrdenID = ?
    `, [id]);

    if (!productos || productos.length === 0) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ error: "No se encontraron productos en el pedido" });
    }

    // Actualizar inventario para cada producto
    for (const producto of productos) {
      await connection.execSync(`
        UPDATE Productos SET 
          StockActual = StockActual + ?,
          PrecioCompra = ?,
          FechaUltimaCompra = CURRENT_DATE
        WHERE ID = ?
      `, [producto.CANTIDAD, producto.PRECIOUNITARIO, producto.PRODUCTOID]);
    }

    // Marcar pedido como procesado en inventario
    await connection.execSync(`
      UPDATE Ordenes SET 
        Estatus = 'Inventariado'
      WHERE ID = ?
    `, [id]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ 
      message: "Productos agregados al inventario exitosamente",
      totalProductos: productos.length,
      pedidoId: id
    });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al enviar a inventario:", error);
    res.status(500).json({ error: "Error al actualizar inventario" });
  }
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
  enviarAInventario
};