const { OpenAI } = require('openai');
const { connection } = require('../config/db');
const logger = require('../utils/logger');

// Configuración de conexión a OpenAI - Usando la nueva API key proporcionada
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Información de esquema de la base de datos para proporcionar contexto al modelo (Schema completo)
const DB_SCHEMA = `
-- 1.1 Tabla de Roles
Rol2 (
  Rol_ID INTEGER PRIMARY KEY,
  Nombre NVARCHAR(100) NOT NULL
);

-- 1.2 Tabla de Locations
Location2 (
  Location_ID INTEGER PRIMARY KEY,
  Nombre NVARCHAR(100),
  Tipo NVARCHAR(50),
  PosicionX INTEGER,
  PosicionY INTEGER,
  FechaCreado DATE
);

-- 1.3 Tabla de Usuarios
Usuario2 (
  Usuario_ID INTEGER PRIMARY KEY,
  Correo NVARCHAR(255),
  Username NVARCHAR(100),
  Nombre NVARCHAR(100) NOT NULL,
  Rol_ID INTEGER,
  Clave NVARCHAR(255) NOT NULL,
  Location_ID INTEGER,
  FechaEmpiezo DATE,
  RFC NVARCHAR(13),
  FOREIGN KEY (Rol_ID) REFERENCES Rol2(Rol_ID),
  FOREIGN KEY (Location_ID) REFERENCES Location2(Location_ID)
);

-- 1.4 Tabla de Artículos
Articulo2 (
  Articulo_ID INTEGER PRIMARY KEY,
  Nombre NVARCHAR(100) NOT NULL,
  Categoria NVARCHAR(100),
  PrecioProveedor DECIMAL(10,2),
  PrecioVenta DECIMAL(10,2),
  Temporada NVARCHAR(50)
);

-- 1.5 Tabla de Inventario
Inventario2 (
  Inventario_ID INTEGER PRIMARY KEY,
  Articulo_ID INTEGER,
  Location_ID INTEGER,
  StockActual INTEGER,
  Importacion INTEGER,
  Exportacion INTEGER,
  StockMinimo INTEGER,
  StockRecomendado INTEGER,
  FechaUltimaImportacion DATE,
  FechaUltimaExportacion DATE,
  MargenGanancia DECIMAL(5,2),
  TiempoReposicion DECIMAL(5,2),
  StockSeguridad INTEGER,
  DemandaPromedio DECIMAL(5,2),
  FOREIGN KEY (Articulo_ID) REFERENCES Articulo2(Articulo_ID),
  FOREIGN KEY (Location_ID) REFERENCES Location2(Location_ID)
);

-- 1.6 Tabla de Fabricación
Fabricacion2 (
  Fabricacion_ID INTEGER PRIMARY KEY,
  Location_ID INTEGER,
  Articulo_ID INTEGER,
  FOREIGN KEY (Location_ID) REFERENCES Location2(Location_ID),
  FOREIGN KEY (Articulo_ID) REFERENCES Articulo2(Articulo_ID)
);

-- 1.7 Tabla de Métodos de Pago
MetodoPago2 (
  MetodoPago_ID INTEGER PRIMARY KEY,
  Nombre NVARCHAR(100) NOT NULL
);

-- 1.8 Tabla de Órdenes
Ordenes2 (
  Orden_ID INTEGER PRIMARY KEY,
  Creado_por_ID INTEGER,
  Modificado_por_ID INTEGER,
  TipoOrden NVARCHAR(50),
  Organizacion NVARCHAR(100),  -- Nombre del proveedor o cliente
  FechaCreacion DATE,
  FechaAceptacion DATE,
  FechaLimitePago DATE,
  FechaEstimadaEntrega DATE,
  FechaEntrega DATE,
  EntregaATiempo BOOLEAN,
  Estado NVARCHAR(50),
  Total DECIMAL(10,2),
  MetodoPago_ID INTEGER,
  DescuentoAplicado DECIMAL(5,2),
  TiempoReposicion DECIMAL(5,2),
  TiempoEntrega DECIMAL(5,2),
  FOREIGN KEY (Creado_por_ID) REFERENCES Usuario2(Usuario_ID),
  FOREIGN KEY (Modificado_por_ID) REFERENCES Usuario2(Usuario_ID),
  FOREIGN KEY (MetodoPago_ID) REFERENCES MetodoPago2(MetodoPago_ID)
);

-- 1.9 Tabla de OrdenesProductos
OrdenesProductos2 (
  OrdenesProductos_ID INTEGER PRIMARY KEY,
  Orden_ID INTEGER,
  Inventario_ID INTEGER,
  Cantidad INTEGER,
  PrecioUnitario DECIMAL(10,2),
  FOREIGN KEY (Orden_ID) REFERENCES Ordenes2(Orden_ID),
  FOREIGN KEY (Inventario_ID) REFERENCES Inventario2(Inventario_ID)
);

-- 1.10 Tabla de Comentarios de Órdenes
ComentariosOrdenes2 (
  Comentario_ID INTEGER PRIMARY KEY,
  Orden_ID INTEGER,
  Creado_por_ID INTEGER,
  Comentario NCLOB,
  FechaCreado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Orden_ID) REFERENCES Ordenes2(Orden_ID),
  FOREIGN KEY (Creado_por_ID) REFERENCES Usuario2(Usuario_ID)
);

-- 1.11 Tabla de Pagos por Orden
PagoOrden2 (
  Pago_ID INTEGER PRIMARY KEY,
  Orden_ID INTEGER,
  MetodoPago_ID INTEGER,
  EstadoPago NVARCHAR(50),
  ComentarioPago NCLOB,
  FechaPago DATE,
  DescuentoAplicado DECIMAL(5,2),
  FOREIGN KEY (Orden_ID) REFERENCES Ordenes2(Orden_ID),
  FOREIGN KEY (MetodoPago_ID) REFERENCES MetodoPago2(MetodoPago_ID)
);

-- 1.12 Tabla de Historial de Productos
HistorialProductos2 (
  Historial_ID INTEGER PRIMARY KEY,
  Inventario_ID INTEGER,
  Location_ID INTEGER,
  Anio INTEGER,
  Mes INTEGER,
  Importacion INTEGER,
  Exportacion INTEGER,
  StockStart INTEGER,
  StockEnd INTEGER,
  FOREIGN KEY (Inventario_ID) REFERENCES Inventario2(Inventario_ID),
  FOREIGN KEY (Location_ID) REFERENCES Location2(Location_ID)
);

-- 1.13 Tabla de Alertas
Alertas2 (
  Alerta_ID INTEGER PRIMARY KEY,
  Descripcion NCLOB,
  FechaCreacion DATE,
  OrdenesProductos_ID INTEGER,
  Location_ID INTEGER,
  FOREIGN KEY (OrdenesProductos_ID) REFERENCES OrdenesProductos2(OrdenesProductos_ID),
  FOREIGN KEY (Location_ID) REFERENCES Location2(Location_ID)
);

-- Información importante:
-- 1. Para ventas o compras, usar TipoOrden en Ordenes2: 'Compra' (para proveedores) o 'Venta' (para clientes)
-- 2. La Organizacion en Ordenes2 contiene el nombre del proveedor o cliente
-- 3. Las órdenes tienen estados como 'Pendiente', 'Aceptada', 'Rechazada', 'Entregada'
-- 4. Para inventario por ubicación, relacionar Inventario2 con Location2
`;

// Ejemplos de preguntas y sus consultas SQL correspondientes
const EXAMPLE_QUERIES = `
Ejemplos de preguntas que puedes responder:

1. Preguntas sobre pedidos de un proveedor específico:
   - "Muestra los pedidos del proveedor X"
   - "¿Cuánto se ha comprado al proveedor X?"
   - "¿Cuál fue el último pedido al proveedor X?"
   - "Total de compras por proveedor"
   
2. Preguntas sobre ventas:
   - "¿Cuánto se vendió este mes?"
   - "¿Cuáles son las ventas por período?"
   - "¿Quién es el cliente que más compra?"
   - "Ventas totales por producto"
   
3. Preguntas sobre pedidos:
   - "¿Cuál fue el último pedido?"
   - "Muestra los pedidos pendientes"
   - "¿Cuántos pedidos hay en total?"
   - "¿Cuál es el pedido con el monto más alto?"
   
4. Preguntas sobre inventario:
   - "¿Cuántos productos tenemos en inventario?"
   - "¿Qué productos están bajos de stock?"
   - "¿Cuál es el producto con mayor inventario?"
   - "¿En qué ubicaciones tenemos el producto X?"
`;

// Recompensa para ejemplos exitosos para ayudar a aprender al modelo
const EXAMPLE_REWARD_QUERIES = `
Ejemplos de SQL exitosos para diferentes tipos de preguntas:

1. Para pedidos de un proveedor específico:
   Pregunta: "Muestra los pedidos del proveedor Acme"
   SQL: SELECT o.Orden_ID, o.FechaCreacion, o.Total, o.Estado FROM Ordenes2 o WHERE o.TipoOrden = 'Compra' AND o.Organizacion = 'Acme' ORDER BY o.FechaCreacion DESC

2. Para ventas por período:
   Pregunta: "Ventas del mes pasado"
   SQL: SELECT SUM(o.Total) as TotalVentas FROM Ordenes2 o WHERE o.TipoOrden = 'Venta' AND o.FechaCreacion BETWEEN ADD_MONTHS(CURRENT_DATE, -1) AND CURRENT_DATE

3. Para detalles de una orden:
   Pregunta: "Detalle del pedido 123"
   SQL: SELECT a.Nombre, op.Cantidad, op.PrecioUnitario, (op.Cantidad * op.PrecioUnitario) as Subtotal FROM OrdenesProductos2 op JOIN Inventario2 i ON op.Inventario_ID = i.Inventario_ID JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID WHERE op.Orden_ID = 123

4. Para inventario bajo:
   Pregunta: "Productos con stock bajo"
   SQL: SELECT a.Articulo_ID, a.Nombre, i.StockActual, i.StockMinimo FROM Inventario2 i JOIN Articulo2 a ON i.Articulo_ID = a.Articulo_ID WHERE i.StockActual < i.StockMinimo
`;

// Inicializar la conexión con OpenAI
const initializeOpenAI = async () => {
  try {
    // Verificar que tenemos la clave API
    if (!process.env.OPENAI_API_KEY) {
      logger.error('Error: No se encontró la clave API de OpenAI en las variables de entorno');
      return false;
    }

    logger.info(`Conectando con OpenAI usando la clave API configurada`);

    // Test básico de la conexión con OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [{ role: "user", content: "Hola, ¿estás funcionando?" }],
      max_tokens: 50
    });

    if (response && response.choices && response.choices.length > 0) {
      logger.info('Conexión exitosa con OpenAI');
      return true;
    } else {
      logger.error(`Error al conectar con OpenAI: No se pudo obtener una respuesta válida`);
      return false;
    }
  } catch (error) {
    logger.error(`Error al inicializar OpenAI: ${error.message}`);
    return false;
  }
};

// Función para convertir la pregunta del usuario en una consulta SQL
const generateSQLQuery = async (question) => {
  try {
    const messages = [
      {
        role: "system",
        content: `Eres un experto en SQL para bases de datos SAP HANA, especializado en convertir preguntas en lenguaje natural a consultas SQL. Tu tarea es generar consultas SQL válidas basadas en el siguiente esquema de base de datos:
        
${DB_SCHEMA}

Algunos ejemplos de consultas exitosas:
${EXAMPLE_REWARD_QUERIES}

Reglas importantes:
1. Genera SOLO la consulta SQL, sin explicaciones ni texto adicional.
2. Usa la sintaxis específica de SAP HANA.
3. Si la pregunta menciona un proveedor o cliente específico, usa el campo Organizacion en Ordenes2.
4. Para consultas de proveedores, filtra por TipoOrden = 'Compra'.
5. Para consultas de ventas o clientes, filtra por TipoOrden = 'Venta'.
6. Usa JOIN para conectar tablas relacionadas y obtener información completa.
7. Si la pregunta no se puede convertir en SQL, responde con "NO_SQL: " seguido de una explicación breve.
8. No uses comillas invertidas para la consulta SQL.

Cuando te recompense con un mensaje de "RECOMPENSA", significa que tu consulta SQL fue particularmente buena. Aprende de esos ejemplos para futuras consultas.

Prioriza la precisión sobre la simplicidad. Es mejor generar una consulta compleja pero correcta que una simple pero incompleta.`
      },
      {
        role: "user",
        content: question
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: messages,
      max_tokens: 500,
      temperature: 0.2
    });

    const sqlQuery = response.choices[0].message.content.trim();
    
    // Verificar si la respuesta indica que no se puede generar SQL
    if (sqlQuery.startsWith("NO_SQL:")) {
      return {
        canConvert: false,
        query: null,
        explanation: sqlQuery.substring(7).trim()
      };
    }

    // Registrar consultas exitosas para aprendizaje
    logger.info(`Consulta SQL generada: ${sqlQuery}`);

    return {
      canConvert: true,
      query: sqlQuery
    };
  } catch (error) {
    logger.error(`Error al generar consulta SQL: ${error.message}`);
    return {
      canConvert: false,
      query: null,
      explanation: `Error al generar la consulta SQL: ${error.message}`
    };
  }
};

// Función para ejecutar la consulta SQL en la base de datos
const executeSQLQuery = async (sqlQuery) => {
  return new Promise((resolve, reject) => {
    connection.exec(sqlQuery, [], (err, result) => {
      if (err) {
        logger.error(`Error al ejecutar consulta SQL: ${err.message}`);
        reject(err);
      } else {
        logger.info(`Consulta ejecutada con éxito, ${result ? (Array.isArray(result) ? result.length : 1) : 0} resultados`);
        resolve(result);
      }
    });
  });
};

// Sistema de recompensa - guarda consultas SQL exitosas
const logSuccessfulQuery = async (question, sqlQuery) => {
  try {
    // Aquí podrías guardar en un archivo o base de datos las consultas exitosas
    // para analizar patrones y mejorar el modelo
    logger.info(`CONSULTA EXITOSA - Pregunta: "${question}", SQL: ${sqlQuery}`);
    
    // Enviar recompensa al modelo para reforzar el aprendizaje
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "system",
          content: "Eres un asistente SQL que aprende de ejemplos exitosos."
        },
        {
          role: "user",
          content: `Pregunta: ${question}\nConsulta SQL: ${sqlQuery}`
        },
        {
          role: "assistant",
          content: sqlQuery
        },
        {
          role: "user",
          content: "RECOMPENSA: Esta consulta SQL fue perfecta y devolvió exactamente lo que se necesitaba."
        }
      ],
      max_tokens: 50
    });
  } catch (error) {
    logger.error(`Error al registrar consulta exitosa: ${error.message}`);
  }
};

// Función para generar una respuesta en lenguaje natural basada en los resultados de la consulta
const generateResponse = async (question, sqlQuery, queryResult) => {
  try {
    // Formatear el resultado para OpenAI
    let formattedResult = '';
    let resultadoExitoso = false;
    
    if (Array.isArray(queryResult)) {
      if (queryResult.length === 0) {
        formattedResult = "No se encontraron resultados.";
      } else {
        formattedResult = JSON.stringify(queryResult, null, 2);
        resultadoExitoso = true;
      }
    } else if (queryResult) {
      formattedResult = JSON.stringify(queryResult, null, 2);
      resultadoExitoso = true;
    } else {
      formattedResult = "No se obtuvieron resultados o el resultado fue nulo.";
    }

    // Si la consulta fue exitosa, registrarla para aprendizaje
    if (resultadoExitoso) {
      await logSuccessfulQuery(question, sqlQuery);
    }

    const messages = [
      {
        role: "system",
        content: `Eres un asistente de IA profesional especializado en sistemas de inventario y ventas. Tu tarea es interpretar datos de consultas SQL y explicarlos claramente. 
        
Reglas para tus respuestas:
1. Responde en español de manera clara y directa.
2. Estructura tu respuesta con viñetas o numeración cuando corresponda.
3. Menciona cifras y datos específicos (montos, cantidades, fechas).
4. Si la consulta es sobre un proveedor o cliente específico, asegúrate de indicar su nombre.
5. Para consultas de ventas o compras, menciona siempre el período y los totales.
6. Si no hay resultados, sugiere posibles razones (ej: "El proveedor X no tiene pedidos registrados").

Ejemplos de buenas respuestas:
- "El proveedor Acme tiene 5 pedidos en total, por un monto de $12,500. El último fue realizado el 15/05/2023."
- "Las ventas del mes actual suman $45,200, un 15% más que el mes anterior."
- "El producto con mayor inventario es 'Silla Ergonómica' con 120 unidades disponibles."
- "No hay productos con stock bajo en este momento."

Si los datos son confusos o insuficientes, indícalo claramente y sugiere cómo obtener mejor información.`
      },
      {
        role: "user",
        content: `Pregunta del usuario: ${question}
        
Consulta SQL ejecutada: ${sqlQuery}
        
Resultados:
${formattedResult}
        
Por favor, responde a la pregunta del usuario basándote en estos resultados.`
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.error(`Error al generar respuesta: ${error.message}`);
    return `Lo siento, ocurrió un error al procesar la respuesta: ${error.message}`;
  }
};

// Función principal para consultar al asistente con una pregunta
const queryAssistant = async (question) => {
  try {
    logger.info(`Procesando pregunta: ${question}`);

    // Paso 1: Convertir la pregunta en una consulta SQL
    const sqlResult = await generateSQLQuery(question);
    
    if (!sqlResult.canConvert) {
      // Si no se puede convertir a SQL, intentar responder directamente
      const directResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {
            role: "system",
            content: `Eres un asistente especializado en sistemas de inventario y pedidos para negocios. Tu base de conocimiento incluye:

1. Gestión de pedidos a proveedores y de clientes
2. Control de inventario y stock
3. Métricas de ventas y compras
4. Seguimiento de entregas y tiempos

Responde de manera profesional y directa. Si no puedes responder una pregunta específica sobre los datos, sugiere qué información podrían consultar.

Aquí hay ejemplos de preguntas que puedes responder:
${EXAMPLE_QUERIES}

Si te preguntan sobre un proveedor específico, explica que necesitas el nombre del proveedor para consultar sus pedidos o información relacionada.`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 500
      });
      
      return {
        success: true,
        answer: directResponse.choices[0].message.content.trim(),
        source: 'openai_direct'
      };
    }
    
    logger.info(`Consulta SQL generada: ${sqlResult.query}`);
    
    // Paso 2: Ejecutar la consulta SQL en la base de datos
    let queryResult;
    try {
      queryResult = await executeSQLQuery(sqlResult.query);
    } catch (error) {
      logger.error(`Error ejecutando SQL: ${error.message}`);
      
      // Si hay error en la ejecución, intentamos generar una mejor respuesta
      const errorResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
          {
            role: "system",
            content: "Eres un asistente técnico para base de datos. Explica los errores SQL de manera simple y sugiere cómo reformular la pregunta."
          },
          {
            role: "user",
            content: `La siguiente consulta SQL generó un error: ${sqlResult.query}\n\nError: ${error.message}\n\nLa pregunta original era: "${question}"\n\nPor favor, explica qué pudo haber fallado y sugiere cómo reformular la pregunta para obtener la información deseada.`
          }
        ],
        max_tokens: 500
      });
      
      return {
        success: false,
        error: errorResponse.choices[0].message.content.trim()
      };
    }
    
    // Paso 3: Generar una respuesta en lenguaje natural basada en los resultados
    const answer = await generateResponse(question, sqlResult.query, queryResult);
    
    return {
      success: true,
      answer: answer,
      source: 'openai_sql'
    };
    
  } catch (error) {
    logger.error(`Error general en queryAssistant: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  initializeOpenAI,
  queryAssistant
}; 