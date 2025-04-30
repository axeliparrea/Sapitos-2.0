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
    const { creadaPor, productos, total, metodoPago = 'Efectivo', descuentoAplicado = 0 } = req.body;

    if (!creadaPor || !productos?.length || total === undefined) {
      return res.status(400).json({ error: "Datos incompletos para crear el pedido" });
    }

    await connection.execSync('BEGIN');

    // Insertar encabezado del pedido
    const pedidoResult = await connection.execSync(`
      INSERT INTO Ordenes (
        Creada_por, FechaCreacion, Estatus, Total, MetodoPago, DescuentoAplicado
      ) VALUES (?, CURRENT_DATE, 'Pendiente', ?, ?, ?)
      RETURNING ID
    `, [creadaPor, total, metodoPago, descuentoAplicado]);

    const pedidoId = pedidoResult[0].ID;

    // Insertar productos del pedido
    for (const producto of productos) {
      await connection.execSync(`
        INSERT INTO OrdenesProductos (OrdenID, ProductoID, Cantidad, PrecioUnitario)
        VALUES (?, ?, ?, ?)
      `, [pedidoId, producto.id, producto.cantidad, producto.precioUnitario]);

      await connection.execSync(`
        INSERT INTO HistorialPreciosProductos (ProductoID, PrecioCompra, FechaCambio, MotivoCambio)
        VALUES (?, ?, CURRENT_DATE, 'Pedido #' || ?)
      `, [producto.id, producto.precioUnitario, pedidoId]);
    }

    await connection.execSync('COMMIT');
    
    res.status(201).json({ 
      message: "Pedido creado exitosamente",
      pedidoId,
      totalProductos: productos.length
    });

  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear el pedido", detalle: error.message });
  }
};

// Eliminar pedido
const deletePedido = async (req, res) => {
  const { id } = req.params;
  try {
    await connection.execSync('BEGIN');
    
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

  try {
    // No permitir cambiar el estado directamente (usar las funciones específicas)
    if (estatus) {
      return res.status(400).json({ error: "Use las rutas específicas para cambiar el estado" });
    }

    const campos = [];
    const valores = [];
    
    // Construir dinámicamente la consulta
    for (const [key, value] of Object.entries(datos)) {
      campos.push(`${key} = ?`);
      valores.push(value);
    }
    
    if (campos.length === 0) {
      return res.status(400).json({ error: "No hay datos para actualizar" });
    }

    const query = `UPDATE Ordenes SET ${campos.join(', ')} WHERE ID = ?`;
    await connection.execSync(query, [...valores, id]);
    
    res.status(200).json({ message: "Pedido actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar el pedido" });
  }
};

// Obtener proveedores
const getProveedores = async (req, res) => {
  try {
    connection.exec('SELECT Correo, Nombre FROM Usuarios WHERE Rol = ?', ['proveedor'], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
};

// Aprobar pedido (para proveedores)
const aprobarPedido = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el pedido esté pendiente
    const [pedido] = await connection.execSync('SELECT Estatus, Creada_por FROM Ordenes WHERE ID = ?', [id]);
    
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    
    if (pedido.Estatus !== 'Pendiente') {
      return res.status(400).json({ error: "Solo se pueden aprobar pedidos en estado Pendiente" });
    }

    // Verificar que el usuario sea el proveedor correspondiente
    if (pedido.Creada_por !== req.user.correo) {
      return res.status(403).json({ error: "No tienes permiso para aprobar este pedido" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE Ordenes SET 
        Estatus = 'Aprobado',
        FechaAceptacion = CURRENT_DATE,
        FechaEstimaEntrega = CURRENT_DATE + 7
      WHERE ID = ?
    `, [id]);

    // Registrar comentario
    await connection.execSync(`
      INSERT INTO ComentariosOrdenes (OrdenID, Creado_por, Comentario, FechaCreado)
      VALUES (?, ?, 'Pedido aprobado por el proveedor', CURRENT_DATE)
    `, [id, req.user.correo]);

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
  const { calidad, entregaATiempo } = req.body;

  try {
    // Validar calidad (1-5)
    if (calidad < 1 || calidad > 5) {
      return res.status(400).json({ error: "La calidad debe ser entre 1 y 5" });
    }

    await connection.execSync('BEGIN');
    
    // Actualizar estado y fechas
    await connection.execSync(`
      UPDATE Ordenes SET 
        Estatus = 'Completado',
        FechaEntrega = CURRENT_DATE,
        Calidad = ?,
        EntregaATiempo = ?,
        TiempoEntrega = CURRENT_DATE - FechaAceptacion
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
  try {
    connection.exec(`
      SELECT * FROM Ordenes 
      WHERE Creada_por = ?
      ORDER BY FechaCreacion DESC
    `, [correo], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error al obtener pedidos del proveedor:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// Obtener detalles de un pedido
const getDetallesPedido = async (req, res) => {
  const { id } = req.params;
  try {
    connection.exec(`
      SELECT p.*, op.Cantidad, op.PrecioUnitario
      FROM OrdenesProductos op
      JOIN Productos p ON op.ProductoID = p.ID
      WHERE op.OrdenID = ?
    `, [id], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error al obtener detalles del pedido:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};

// Enviar pedido a inventario
const enviarAInventario = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que el pedido esté completado
    const [pedido] = await connection.execSync('SELECT Estatus FROM Ordenes WHERE ID = ?', [id]);
    
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

    // Registrar en bitácora
    await connection.execSync(`
      INSERT INTO Bitacora_General (MaestroID, CampoID, Nombre, Descripcion)
      VALUES (1, ?, 'Recepcion de pedido', ?)
    `, [id, `Pedido #${id} enviado a inventario`]);

    await connection.execSync('COMMIT');
    
    res.status(200).json({ 
      message: "Productos agregados al inventario",
      totalProductos: productos.length
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
  aprobarPedido,
  entregarPedido,
  getPedidosProveedor,
  getDetallesPedido,
  enviarAInventario
};