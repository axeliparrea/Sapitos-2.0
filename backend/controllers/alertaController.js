const { connection } = require("../config/db");

/**
 * Obtener todas las alertas, opcionalmente filtradas por rol
 */
const getAlertas = (req, res) => {
  const { rol_id, usuario_id } = req.query;
  
  console.log('GET /alertas - Query params:', { rol_id, usuario_id });
  
  let query = `
    SELECT 
      a.Alerta_ID as id,
      a.Descripcion as descripcion,
      a.FechaCreacion as fecha,
      a.Location_ID as location_id,
      a.Prioridad as prioridad,
      a.OrdenesProductos_ID as orden_producto_id
    FROM Alertas2 
  `;
  
  let params = [];
  
  // Filtrar por rol_id si está presente
  if (rol_id) {
    query += " WHERE u.Rol_ID = ?";
    params.push(rol_id);
    
    // Añadir filtro de usuario_id si también está presente
    if (usuario_id) {
      query += " AND u.Usuario_ID = ?";
      params.push(usuario_id);
    }
  } else if (usuario_id) {
    // Solo filtrar por usuario_id si no hay rol_id
    query += " WHERE u.Usuario_ID = ?";
    params.push(usuario_id);
  }
  
  // Ordenar por fecha más reciente
  query += " ORDER BY a.FechaCreacion DESC";
  
  console.log('Executing SQL query:', query);
  console.log('With params:', params);

  connection.exec(query, params, (err, rows) => {
    if (err) {
      console.error("Error al obtener alertas:", err);
      return res.status(500).json({ error: "Error al obtener alertas" });
    }
    
    console.log('Raw DB results:', rows);
    
    // Si no hay filas, devolver array vacío
    if (!rows || !rows.length) {
      console.log('No alerts found, returning empty array');
      return res.json([]);
    }
    
    // Procesar las alertas para añadir información y formato adicional
    const alertas = rows.map(alerta => {
      // Determinar el tipo de alerta basado en su descripción o prioridad
      let tipo = 'primary'; // Por defecto
      
      if (alerta.descripcion.includes('Error') || 
          alerta.descripcion.includes('error') || 
          alerta.descripcion.includes('fallo') ||
          alerta.descripcion.includes('stock')) {
        tipo = 'danger';
      } else if (alerta.descripcion.includes('Completado') || 
                alerta.descripcion.includes('exitosa')) {
        tipo = 'success';
      } else if (alerta.descripcion.includes('retrasada')) {
        tipo = 'warning';
      }
      
      // Extraer ID de orden si existe en la descripción
      const ordenIdMatch = alerta.descripcion.match(/Orden ID (\d+)/);
      const ordenId = ordenIdMatch ? ordenIdMatch[1] : null;
      
      // Extraer ID de usuario si existe en la descripción
      const usuarioIdMatch = alerta.descripcion.match(/usuario ID (\d+)/);
      const usuarioId = usuarioIdMatch ? usuarioIdMatch[1] : null;
      
      // Crear título más conciso
      let titulo = alerta.descripcion;
      if (ordenId) {
        if (alerta.descripcion.includes('En Reparto')) {
          titulo = `Orden #${ordenId} en reparto`;
        } else if (alerta.descripcion.includes('Completado')) {
          titulo = `Orden #${ordenId} completada`;
        } else if (alerta.descripcion.includes('Nueva orden')) {
          titulo = `Nueva orden #${ordenId} creada`;
        } else if (alerta.descripcion.includes('Pago pendiente')) {
          titulo = `Pago pendiente de orden #${ordenId}`;
        }
      } else if (alerta.descripcion.includes('Producto')) {
        titulo = `Alerta de inventario`;
      } else if (usuarioId) {
        titulo = `Nuevo usuario registrado`;
      }
      
      return {
        id: alerta.id,
        tipo,
        titulo,
        descripcion: alerta.descripcion,
        fecha: alerta.fecha,
        orden_id: ordenId,
        usuario_id: usuarioId,
        location_id: alerta.location_id
      };
    });
    
    res.json(alertas);
  });
};

/**
 * Eliminar una alerta específica
 */
const deleteAlerta = (req, res) => {
  const { id } = req.params;
  
  const query = "DELETE FROM Alertas2 WHERE Alerta_ID = ?";
  
  connection.exec(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar alerta:", err);
      return res.status(500).json({ error: "Error al eliminar la alerta" });
    }
    
    res.json({ message: "Alerta eliminada correctamente" });
  });
};

/**
 * Crear una nueva alerta (útil para pruebas o notificaciones manuales)
 */
const createAlerta = (req, res) => {
  const { descripcion, location_id, prioridad = 1, orden_producto_id = null } = req.body;
  
  if (!descripcion || !location_id) {
    return res.status(400).json({ error: "La descripción y el location_id son obligatorios" });
  }
  
  const query = `
    INSERT INTO Alertas2 (
      Descripcion, 
      FechaCreacion, 
      Location_ID, 
      Prioridad, 
      OrdenesProductos_ID
    ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)
  `;
  
  connection.exec(query, [descripcion, location_id, prioridad, orden_producto_id], (err, result) => {
    if (err) {
      console.error("Error al crear alerta:", err);
      return res.status(500).json({ error: "Error al crear la alerta" });
    }
    
    res.status(201).json({ message: "Alerta creada correctamente" });
  });
};



/**
 * Función para crear notificaciones del sistema que puede ser llamada desde otros controladores
 * Esta función abstrae la creación de alertas para facilitar su uso desde cualquier parte
 * @param {string} descripcion - Descripción detallada de la alerta
 * @param {string} titulo - Título corto de la alerta
 * @param {string} tipo - Tipo de alerta: 'success', 'danger', 'warning', 'info', 'primary'
 * @param {number} location_id - ID de la ubicación relacionada con la alerta
 * @param {number} [orden_id=null] - ID de la orden relacionada (opcional)
 * @param {number} [prioridad=1] - Prioridad de la alerta (1-5)
 * @returns {Promise<Object>} - Promesa con el resultado de la operación
 */
const generarNotificacion = async (descripcion, titulo, tipo, location_id, orden_id = null, prioridad = 1) => {
  return new Promise((resolve, reject) => {
    if (!descripcion || !location_id) {
      reject(new Error('La descripción y el location_id son obligatorios'));
      return;
    }

    // Aquí creamos el registro en la base de datos
    const query = `
      INSERT INTO Alertas2 (
        Descripcion, 
        FechaCreacion, 
        Location_ID, 
        Prioridad, 
        OrdenesProductos_ID
      ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)
    `;

    const params = [descripcion, location_id, prioridad, orden_id];

    connection.exec(query, params, (err, result) => {
      if (err) {
        console.error("Error al crear notificación:", err);
        reject(err);
        return;
      }

      // Obtener el ID de la alerta creada
      connection.exec("SELECT CURRENT_IDENTITY_VALUE() AS alertaId FROM DUMMY", [], (err2, result2) => {
        if (err2) {
          console.error("Error al obtener ID de alerta:", err2);
          // Aún así consideramos exitosa la operación
          resolve({
            success: true,
            message: 'Notificación creada correctamente, pero no se pudo obtener su ID',
            data: null
          });
          return;
        }

        const alertaId = result2[0]?.ALERTAID || result2[0]?.alertaId || null;
        
        resolve({
          success: true,
          message: 'Notificación creada correctamente',
          data: {
            id: alertaId,
            descripcion,
            titulo,
            tipo,
            fecha: new Date().toISOString(),
            location_id,
            orden_id
          }
        });
      });
    });
  });
};

module.exports = {
  getAlertas,
  deleteAlerta,
  createAlerta,
  generarNotificacion
}; 