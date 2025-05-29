const { connection } = require("../config/db");

// Función para obtener métodos de pago disponibles
const getMetodosPago = async (req, res) => {
  try {
    const query = `SELECT MetodoPago_ID as id, Nombre as nombre FROM MetodoPago2 ORDER BY Nombre`;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener métodos de pago:", err);
        return res.status(500).json({ error: "Error al obtener métodos de pago" });
      }
      
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener roles disponibles
const getRoles = async (req, res) => {
  try {
    const query = `SELECT Rol_ID as id, Nombre as nombre FROM Rol2 ORDER BY Nombre`;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener roles:", err);
        return res.status(500).json({ error: "Error al obtener roles" });
      }
      
      res.status(200).json(result || []);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener todas las locations
const getLocations = async (req, res) => {
  try {
    const query = `
      SELECT 
        Location_ID as id,
        Nombre as nombre,
        Tipo as tipo,
        PosicionX,
        PosicionY,
        FechaCreado,
        (SELECT COUNT(*) FROM Usuario2 WHERE Location_ID = l.Location_ID) as totalUsuarios,
        (SELECT COUNT(*) FROM Inventario2 WHERE Location_ID = l.Location_ID) as totalProductos
      FROM Location2 l
      ORDER BY Nombre
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener locations:", err);
        return res.status(500).json({ error: "Error al obtener locations" });
      }
      
      const locationsFormateadas = (result || []).map(location => ({
        id: location.id,
        nombre: location.nombre,
        tipo: location.tipo,
        posicionX: location.PosicionX,
        posicionY: location.PosicionY,
        fechaCreado: location.FechaCreado,
        totalUsuarios: location.totalUsuarios || 0,
        totalProductos: location.totalProductos || 0
      }));
      
      res.status(200).json(locationsFormateadas);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener locations/proveedores por tipo
const getLocationsPorTipo = async (req, res) => {
  const { tipo } = req.params;
  
  if (!tipo) {
    return res.status(400).json({ error: "Tipo de location requerido" });
  }
  
  try {
    const query = `
      SELECT 
        Location_ID as id,
        Nombre as nombre,
        Tipo as tipo,
        PosicionX,
        PosicionY,
        FechaCreado,
        (SELECT COUNT(*) FROM Usuario2 WHERE Location_ID = l.Location_ID) as totalUsuarios,
        (SELECT COUNT(*) FROM Inventario2 WHERE Location_ID = l.Location_ID) as totalProductos,
        (SELECT COUNT(*) FROM Fabricacion2 WHERE Location_ID = l.Location_ID) as totalFabricacion
      FROM Location2 l
      WHERE UPPER(Tipo) = UPPER(?) 
      ORDER BY Nombre
    `;
    
    connection.exec(query, [tipo], (err, result) => {
      if (err) {
        console.error("Error al obtener locations por tipo:", err);
        return res.status(500).json({ error: "Error al obtener locations" });
      }
      
      const locationsFormateadas = (result || []).map(location => ({
        id: location.id,
        nombre: location.nombre,
        tipo: location.tipo,
        posicionX: location.PosicionX,
        posicionY: location.PosicionY,
        fechaCreado: location.FechaCreado,
        totalUsuarios: location.totalUsuarios || 0,
        totalProductos: location.totalProductos || 0,
        totalFabricacion: location.totalFabricacion || 0
      }));
      
      res.status(200).json(locationsFormateadas);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener una location específica
const getLocationById = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de location inválido" });
  }
  
  try {
    const query = `
      SELECT 
        Location_ID as id,
        Nombre as nombre,
        Tipo as tipo,
        PosicionX,
        PosicionY,
        FechaCreado
      FROM Location2 
      WHERE Location_ID = ?
    `;
    
    connection.exec(query, [id], (err, result) => {
      if (err) {
        console.error("Error al obtener location:", err);
        return res.status(500).json({ error: "Error al obtener location" });
      }
      
      if (!result || result.length === 0) {
        return res.status(404).json({ error: "Location no encontrada" });
      }
      
      const location = result[0];
      const locationFormateada = {
        id: location.id,
        nombre: location.nombre,
        tipo: location.tipo,
        posicionX: location.PosicionX,
        posicionY: location.PosicionY,
        fechaCreado: location.FechaCreado
      };
      
      res.status(200).json(locationFormateada);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para crear nueva location
const insertLocation = async (req, res) => {
  try {
    const { nombre, tipo, posicionX, posicionY } = req.body;
    
    // Validaciones
    if (!nombre || !tipo) {
      return res.status(400).json({ error: "Nombre y tipo son requeridos" });
    }
    
    if (nombre.length > 100) {
      return res.status(400).json({ error: "El nombre no puede exceder 100 caracteres" });
    }
    
    if (tipo.length > 50) {
      return res.status(400).json({ error: "El tipo no puede exceder 50 caracteres" });
    }
    
    // Verificar que no exista una location con el mismo nombre
    const checkQuery = `SELECT Location_ID FROM Location2 WHERE UPPER(Nombre) = UPPER(?)`;
    
    connection.exec(checkQuery, [nombre], async (err, existing) => {
      if (err) {
        console.error("Error al verificar location existente:", err);
        return res.status(500).json({ error: "Error al verificar datos" });
      }
      
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: "Ya existe una location con ese nombre" });
      }
      
      // Insertar nueva location
      const insertQuery = `
        INSERT INTO Location2 (Nombre, Tipo, PosicionX, PosicionY, FechaCreado)
        VALUES (?, ?, ?, ?, CURRENT_DATE)
      `;
      
      const valores = [
        nombre,
        tipo,
        posicionX || null,
        posicionY || null
      ];
      
      connection.exec(insertQuery, valores, (insertErr, result) => {
        if (insertErr) {
          console.error("Error al crear location:", insertErr);
          return res.status(500).json({ error: "Error al crear location" });
        }
        
        res.status(201).json({ 
          message: "Location creada exitosamente",
          nombre: nombre,
          tipo: tipo
        });
      });
    });
  } catch (error) {
    console.error("Error al crear location:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para actualizar location
const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, posicionX, posicionY } = req.body;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de location inválido" });
  }
  
  try {
    // Verificar que la location existe
    const checkQuery = `SELECT Location_ID FROM Location2 WHERE Location_ID = ?`;
    
    connection.exec(checkQuery, [id], (err, existing) => {
      if (err) {
        console.error("Error al verificar location:", err);
        return res.status(500).json({ error: "Error al verificar location" });
      }
      
      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: "Location no encontrada" });
      }
      
      const campos = [];
      const valores = [];
      
      // Construir dinámicamente la consulta de actualización
      if (nombre !== undefined && nombre !== null) {
        if (nombre.length > 100) {
          return res.status(400).json({ error: "El nombre no puede exceder 100 caracteres" });
        }
        campos.push("Nombre = ?");
        valores.push(nombre);
      }
      
      if (tipo !== undefined && tipo !== null) {
        if (tipo.length > 50) {
          return res.status(400).json({ error: "El tipo no puede exceder 50 caracteres" });
        }
        campos.push("Tipo = ?");
        valores.push(tipo);
      }
      
      if (posicionX !== undefined) {
        campos.push("PosicionX = ?");
        valores.push(posicionX);
      }
      
      if (posicionY !== undefined) {
        campos.push("PosicionY = ?");
        valores.push(posicionY);
      }
      
      if (campos.length === 0) {
        return res.status(400).json({ error: "No hay datos para actualizar" });
      }
      
      const updateQuery = `UPDATE Location2 SET ${campos.join(', ')} WHERE Location_ID = ?`;
      valores.push(id);
      
      connection.exec(updateQuery, valores, (updateErr, result) => {
        if (updateErr) {
          console.error("Error al actualizar location:", updateErr);
          return res.status(500).json({ error: "Error al actualizar location" });
        }
        
        res.status(200).json({ message: "Location actualizada exitosamente" });
      });
    });
  } catch (error) {
    console.error("Error al actualizar location:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para eliminar location
const deleteLocation = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID de location inválido" });
  }
  
  try {
    await connection.execSync('BEGIN');
    
    // Verificar que la location existe
    const [location] = await connection.execSync('SELECT Location_ID FROM Location2 WHERE Location_ID = ?', [id]);
    if (!location) {
      await connection.execSync('ROLLBACK');
      return res.status(404).json({ error: "Location no encontrada" });
    }
    
    // Verificar si hay usuarios asociados
    const [usuariosCount] = await connection.execSync('SELECT COUNT(*) as total FROM Usuario2 WHERE Location_ID = ?', [id]);
    if (usuariosCount && usuariosCount.total > 0) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ 
        error: "No se puede eliminar la location porque tiene usuarios asociados" 
      });
    }
    
    // Verificar si hay inventario asociado
    const [inventarioCount] = await connection.execSync('SELECT COUNT(*) as total FROM Inventario2 WHERE Location_ID = ?', [id]);
    if (inventarioCount && inventarioCount.total > 0) {
      await connection.execSync('ROLLBACK');
      return res.status(400).json({ 
        error: "No se puede eliminar la location porque tiene inventario asociado" 
      });
    }
    
    // Eliminar registros de fabricación asociados
    await connection.execSync('DELETE FROM Fabricacion2 WHERE Location_ID = ?', [id]);
    
    // Eliminar la location
    await connection.execSync('DELETE FROM Location2 WHERE Location_ID = ?', [id]);
    
    await connection.execSync('COMMIT');
    res.status(200).json({ message: "Location eliminada exitosamente" });
  } catch (error) {
    await connection.execSync('ROLLBACK');
    console.error("Error al eliminar location:", error);
    res.status(500).json({ error: "Error al eliminar location" });
  }
};

// Función para obtener estadísticas de locations
const getEstadisticasLocations = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.Tipo,
        COUNT(*) as totalLocations,
        COUNT(DISTINCT u.Usuario_ID) as totalUsuarios,
        COUNT(DISTINCT i.Inventario_ID) as totalInventario,
        COUNT(DISTINCT f.Fabricacion_ID) as totalFabricacion,
        COALESCE(SUM(i.StockActual), 0) as stockTotal
      FROM Location2 l
      LEFT JOIN Usuario2 u ON l.Location_ID = u.Location_ID
      LEFT JOIN Inventario2 i ON l.Location_ID = i.Location_ID
      LEFT JOIN Fabricacion2 f ON l.Location_ID = f.Location_ID
      GROUP BY l.Tipo
      ORDER BY l.Tipo
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener estadísticas:", err);
        return res.status(500).json({ error: "Error al obtener estadísticas" });
      }
      
      const estadisticas = (result || []).map(stat => ({
        tipo: stat.Tipo,
        totalLocations: stat.totalLocations || 0,
        totalUsuarios: stat.totalUsuarios || 0,
        totalInventario: stat.totalInventario || 0,
        totalFabricacion: stat.totalFabricacion || 0,
        stockTotal: stat.stockTotal || 0
      }));
      
      // Agregar estadísticas generales
      const totales = estadisticas.reduce((acc, stat) => ({
        totalLocations: acc.totalLocations + stat.totalLocations,
        totalUsuarios: acc.totalUsuarios + stat.totalUsuarios,
        totalInventario: acc.totalInventario + stat.totalInventario,
        totalFabricacion: acc.totalFabricacion + stat.totalFabricacion,
        stockTotal: acc.stockTotal + stat.stockTotal
      }), { totalLocations: 0, totalUsuarios: 0, totalInventario: 0, totalFabricacion: 0, stockTotal: 0 });
      
      res.status(200).json({
        porTipo: estadisticas,
        totales: totales
      });
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener tipos de location únicos
const getTiposLocation = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT Tipo as tipo, COUNT(*) as cantidad
      FROM Location2 
      WHERE Tipo IS NOT NULL
      GROUP BY Tipo
      ORDER BY Tipo
    `;
    
    connection.exec(query, [], (err, result) => {
      if (err) {
        console.error("Error al obtener tipos:", err);
        return res.status(500).json({ error: "Error al obtener tipos" });
      }
      
      const tipos = (result || []).map(tipo => ({
        tipo: tipo.tipo,
        cantidad: tipo.cantidad || 0
      }));
      
      res.status(200).json(tipos);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Función para obtener ubicaciones cercanas (si se usan coordenadas)
const getLocationsCercanas = async (req, res) => {
  const { x, y, radio = 100 } = req.query;
  
  if (!x || !y || isNaN(x) || isNaN(y)) {
    return res.status(400).json({ error: "Coordenadas X e Y son requeridas" });
  }
  
  try {
    const query = `
      SELECT 
        Location_ID as id,
        Nombre as nombre,
        Tipo as tipo,
        PosicionX,
        PosicionY,
        SQRT(POWER(PosicionX - ?, 2) + POWER(PosicionY - ?, 2)) as distancia
      FROM Location2 
      WHERE PosicionX IS NOT NULL 
        AND PosicionY IS NOT NULL
        AND SQRT(POWER(PosicionX - ?, 2) + POWER(PosicionY - ?, 2)) <= ?
      ORDER BY distancia
    `;
    
    connection.exec(query, [x, y, x, y, radio], (err, result) => {
      if (err) {
        console.error("Error al obtener locations cercanas:", err);
        return res.status(500).json({ error: "Error al obtener locations cercanas" });
      }
      
      const locationsCercanas = (result || []).map(location => ({
        id: location.id,
        nombre: location.nombre,
        tipo: location.tipo,
        posicionX: location.PosicionX,
        posicionY: location.PosicionY,
        distancia: Math.round(location.distancia * 100) / 100 // Redondear a 2 decimales
      }));
      
      res.status(200).json(locationsCercanas);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getMetodosPago,
  getRoles,
  getLocations,
  getLocationsPorTipo,
  getLocationById,
  insertLocation,
  updateLocation,
  deleteLocation,
  getEstadisticasLocations,
  getTiposLocation,
  getLocationsCercanas
};