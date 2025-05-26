const { connection } = require("../config/db");

// Obtener todos los pedidos
const getPedido = async (req, res) => {
  try {
    const query = `
      SELECT
        o.ID,
        o.CREADA_POR,
        o.FECHACREACION,
        o.FECHAESTIMAACEPTACION,
        o.FECHAACEPTACION,
        o.FECHAESTIMAPAGO,
        o.FECHAPAGO,
        o.COMPROBANTEPAGO,
        o.FECHAESTIMAENTREGA,
        o.FECHAENTREGA,
        o.ENTREGAATIEMPO,
        o.CALIDAD,
        o.ESTATUS,
        o.TOTAL,
        o.METODOPAGO,
        o.DESCUENTOAPLICADO,
        o.TIEMPOREPOSICION,
        o.TIEMPOENTREGA,
        u.NOMBRE as CREADO_POR_NOMBRE
      FROM ORDENES o
      LEFT JOIN USUARIOS u ON o.CREADA_POR = u.CORREO
      ORDER BY o.FECHACREACION DESC
    `;

    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener los pedidos:", err);
        return res.status(500).json({ error: "Error al obtener los pedidos", detalle: err.message });
      }

      const formatted = (Array.isArray(result) ? result : []).map(pedido => ({
        id: pedido.ID,
        creadaPor: pedido.CREADA_POR,
        creadoPorNombre: pedido.CREADO_POR_NOMBRE,
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
        INSERT INTO ORDENES (
          CREADA_POR, FECHACREACION, ESTATUS, TOTAL, METODOPAGO, DESCUENTOAPLICADO
        ) VALUES (?, COALESCE(?, CURRENT_DATE), 'Pendiente', ?, ?, ?)
        RETURNING ID
      `, [creadaPor, fecha, total, metodoPago, descuentoAplicado]);

      const pedidoId = pedidoResult[0].ID;

      // Insertar productos del pedido
      for (const producto of productos) {
        const precioUnitario = producto.precio || producto.precioCompra || producto.PrecioCompra || 0;
        
        await connection.execSync(`
          INSERT INTO ORDENESPRODUCTOS (ORDENID, PRODUCTOID, CANTIDAD, PRECIOUNITARIO)
          VALUES (?, ?, ?, ?)
        `, [pedidoId, producto.id, producto.cantidad, precioUnitario]);

        // Registrar en historial de precios
        await connection.execSync(`
          INSERT INTO HISTORIALPRECIOSPRODUCTOS (PRODUCTOID, PRECIOCOMPRA, FECHACAMBIO, MOTIVOCAMBIO)
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
    const [pedido] = await connection.execSync('SELECT ID FROM ORDENES WHERE ID = ?', [id]);
    if (!pedido) {
      await connection.execSync('ROLLBACK');
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    // Primero eliminar los productos asociados
    await connection.execSync('DELETE FROM ORDENESPRODUCTOS WHERE ORDENID = ?', [id]);
    
    // Luego eliminar el pedido
    await connection.execSync('DELETE FROM ORDENES WHERE ID = ?', [id]);
    
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

    const query = `UPDATE ORDENES SET ${campos.join(', ')} WHERE ID = ?`;
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
        p.NOMBRE,
        COUNT(pr.ID) as TOTAL_PRODUCTOS
      FROM PROVEEDORES p
      LEFT JOIN PRODUCTOS pr ON p.NOMBRE = pr.PROVEEDOR
      GROUP BY p.NOMBRE
      ORDER BY p.NOMBRE
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
        p.ID,
        p.NOMBRE,
        p.CATEGORIA,
        p.STOCKACTUAL,
        p.PRECIOCOMPRA,
        p.PRECIOVENTA,
        p.TEMPORADA,
        p.FECHAULTIMACOMPRA,
        p.PROVEEDOR
      FROM PRODUCTOS p
      WHERE p.PROVEEDOR = ?
      ORDER BY p.NOMBRE
    `;
    
    connection.exec(query, [nombreProveedor], (err, result) => {
      if (err) {
        console.error("Error al obtener productos:", err);
        return res.status(500).json({ error: "Error al obtener productos", detalle: err.message });
      }
      
      const productosFormateados = (result || []).map(producto => ({
        id: producto.ID,
        nombre: producto.NOMBRE,
        categoria: producto.CATEGORIA,
        stockActual: producto.STOCKACTUAL,
        precioCompra: producto.PRECIOCOMPRA,
        precioVenta: producto.PRECIOVENTA,
        temporada: producto.TEMPORADA,
        fechaUltimaCompra: producto.FECHAULTIMACOMPRA,
        proveedor: producto.PROVEEDOR
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
    const [pedido] = await connection.execSync('SELECT ESTATUS, CREADA_POR FROM ORDENES WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.ESTATUS !== 'Pendiente') {
      return res.status(400).json({ error: "Solo se pueden aprobar pedidos en estado Pendiente" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE ORDENES SET 
        ESTATUS = 'Aprobado',
        FECHAACEPTACION = CURRENT_DATE,
        FECHAESTIMAENTREGA = DATE(CURRENT_DATE, '+7 days')
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
    const [pedido] = await connection.execSync('SELECT ESTATUS FROM ORDENES WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.ESTATUS !== 'Aprobado') {
      return res.status(400).json({ error: "Solo se pueden entregar pedidos en estado Aprobado" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE ORDENES SET 
        ESTATUS = 'Completado',
        FECHAENTREGA = CURRENT_DATE,
        CALIDAD = ?,
        ENTREGAATIEMPO = ?,
        TIEMPOENTREGA = JULIANDAY(CURRENT_DATE) - JULIANDAY(FECHAACEPTACION)
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
      SELECT * FROM ORDENES 
      WHERE CREADA_POR = ?
      ORDER BY FECHACREACION DESC
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
        p.NOMBRE,
        p.CATEGORIA,
        op.CANTIDAD,
        op.PRECIOUNITARIO,
        (op.CANTIDAD * op.PRECIOUNITARIO) as TOTAL
      FROM ORDENESPRODUCTOS op
      JOIN PRODUCTOS p ON op.PRODUCTOID = p.ID
      WHERE op.ORDENID = ?
      ORDER BY p.NOMBRE
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
    const [pedido] = await connection.execSync('SELECT ESTATUS FROM ORDENES WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.ESTATUS !== 'Completado') {
      return res.status(400).json({ 
        error: "Solo se pueden enviar al inventario pedidos en estado Completado" 
      });
    }

    await connection.execSync('BEGIN');
    
    // Obtener productos del pedido
    const productos = await connection.execSync(`
      SELECT PRODUCTOID, CANTIDAD, PRECIOUNITARIO 
      FROM ORDENESPRODUCTOS 
      WHERE ORDENID = ?
    `, [id]);

    if (!productos || productos.length === 0) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ error: "No se encontraron productos en el pedido" });
    }

    // Actualizar inventario para cada producto
    for (const producto of productos) {
      await connection.execSync(`
        UPDATE PRODUCTOS SET 
          STOCKACTUAL = STOCKACTUAL + ?,
          PRECIOCOMPRA = ?,
          FECHAULTIMACOMPRA = CURRENT_DATE
        WHERE ID = ?
      `, [producto.CANTIDAD, producto.PRECIOUNITARIO, producto.PRODUCTOID]);
    }

    // Marcar pedido como procesado en inventario
    await connection.execSync(`
      UPDATE ORDENES SET 
        ESTATUS = 'Inventariado'
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


const getProveedoresInventario = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT
        p.PROVEEDOR as proveedor,
        p.PROVEEDOR as nombre,
        COUNT(p.ID) as totalProductos
      FROM PRODUCTOS p
      WHERE p.PROVEEDOR IS NOT NULL AND p.PROVEEDOR != ''
      GROUP BY p.PROVEEDOR
      ORDER BY p.PROVEEDOR
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener proveedores:", err);
        return res.status(500).json({ error: "Error al obtener proveedores", detalle: err.message });
      }
      
      const proveedoresFormateados = (result || []).map(proveedor => ({
        proveedor: proveedor.proveedor,
        nombre: proveedor.nombre,
        totalProductos: proveedor.totalProductos || 0
      }));
      
      res.status(200).json(proveedoresFormateados);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Obtener productos por proveedor con formato compatible
const getProductosInventarioPorProveedor = async (req, res) => {
  const { nombreProveedor } = req.params;
  
  if (!nombreProveedor) {
    return res.status(400).json({ error: "Nombre de proveedor requerido" });
  }

  try {
    const query = `
      SELECT 
        p.ID,
        p.NOMBRE,
        p.CATEGORIA,
        p.STOCKACTUAL,
        p.PRECIOCOMPRA,
        p.PRECIOVENTA,
        p.TEMPORADA,
        p.FECHAULTIMACOMPRA,
        p.PROVEEDOR,
        p.PRECIOCOMPRA as PrecioCompra,
        p.PRECIOCOMPRA as precio
      FROM PRODUCTOS p
      WHERE p.PROVEEDOR = ?
      ORDER BY p.NOMBRE
    `;
    
    connection.exec(query, [decodeURIComponent(nombreProveedor)], (err, result) => {
      if (err) {
        console.error("Error al obtener productos:", err);
        return res.status(500).json({ error: "Error al obtener productos", detalle: err.message });
      }
      
      const productosFormateados = (result || []).map(producto => ({
        ID: producto.ID,
        id: producto.ID,
        nombre: producto.NOMBRE,
        NOMBRE: producto.NOMBRE,
        categoria: producto.CATEGORIA,
        CATEGORIA: producto.CATEGORIA,
        stockActual: producto.STOCKACTUAL,
        STOCKACTUAL: producto.STOCKACTUAL,
        precioCompra: producto.PRECIOCOMPRA,
        PrecioCompra: producto.PRECIOCOMPRA,
        precio: producto.PRECIOCOMPRA,
        PRECIOCOMPRA: producto.PRECIOCOMPRA,
        precioVenta: producto.PRECIOVENTA,
        PRECIOVENTA: producto.PRECIOVENTA,
        temporada: producto.TEMPORADA,
        TEMPORADA: producto.TEMPORADA,
        fechaUltimaCompra: producto.FECHAULTIMACOMPRA,
        FECHAULTIMACOMPRA: producto.FECHAULTIMACOMPRA,
        proveedor: producto.PROVEEDOR,
        PROVEEDOR: producto.PROVEEDOR
      }));
      
      res.status(200).json(productosFormateados);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualiza el module.exports para incluir las nuevas funciones
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
