const openaiService = require('./openaiService');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

// Inicializar OpenAI cuando se carga el módulo
let isInitialized = false;

const initializeAI = async () => {
  if (!isInitialized) {
    logger.info('Inicializando OpenAI...');
    try {
      const connected = await openaiService.initializeOpenAI();
      
      if (connected) {
        isInitialized = true;
        logger.info('OpenAI inicializado correctamente');
      } else {
        logger.error('No se pudo inicializar OpenAI - verificar credenciales y conexión');
      }
    } catch (error) {
      logger.error(`Error durante la inicialización de OpenAI: ${error.message}`);
    }
  }
};
initializeAI();

// Controlador para manejar preguntas al asistente de IA
const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'La pregunta es requerida'
      });
    }
    
    logger.info(`Pregunta recibida: "${question}"`);
    
    // Asegurarse de que la conexión está establecida
    if (!isInitialized) {
      logger.info('OpenAI no está inicializado, intentando inicializar...');
      await initializeAI();
      
      if (!isInitialized) {
        logger.error('No se pudo inicializar OpenAI para esta solicitud');
        return res.status(500).json({
          success: false,
          message: 'No se pudo conectar con el servicio de IA. Verifique la clave API de OpenAI.'
        });
      }
    }
    
    // Extraer información del usuario del token
    const token = req.cookies.Auth;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No estás autorizado para usar este servicio'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.rol || decoded.ROL;
    const userLocationId = decoded.locationId || decoded.LOCATION_ID;
    
    logger.info(`Usuario rol: ${userRole}, Location ID: ${userLocationId}`);
    
    // Consultar al asistente de IA con restricciones según el rol
    let result;
    if (userRole === 'admin') {
      // Administrador tiene acceso sin restricciones
      logger.info('Consultando al asistente de IA sin restricciones (admin)');
      result = await openaiService.queryAssistant(question);
    } else if ((userRole === 'dueno' || userRole === 'proveedor') && userLocationId) {
      // Dueño y Proveedor solo pueden consultar datos de su ubicación
      logger.info(`Consultando al asistente de IA con restricción de ubicación: ${userLocationId} para rol ${userRole}`);
      result = await openaiService.queryAssistant(question, { locationId: userLocationId });
    } else {
      // Otros roles tienen acceso restringido por defecto
      logger.info(`Consultando al asistente de IA con restricciones estándar`);
      result = await openaiService.queryAssistant(question, { restricted: true });
    }
    
    if (result.success) {
      logger.info('Respuesta obtenida exitosamente');
      return res.status(200).json({
        success: true,
        answer: result.answer,
        source: result.source
      });
    } else {
      logger.error(`Error al obtener respuesta: ${result.error}`);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la pregunta',
        error: result.error
      });
    }
  } catch (error) {
    logger.error(`Error en askAssistant: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Controlador para obtener el estado de la conexión de OpenAI
const getAIStatus = async (req, res) => {
  try {
    const status = isInitialized;
    
    return res.status(200).json({
      success: true,
      connected: status
    });
  } catch (error) {
    logger.error(`Error en getAIStatus: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el estado de la IA',
      error: error.message
    });
  }
};

module.exports = {
  askAssistant,
  getAIStatus,
  initializeAI
}; 