import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MasterLayout from "../../components/masterLayout";

/**
 * ML Model Management Component
 * 
 * Provides an interface for administrators to manage and monitor 
 * the stock prediction model, including manual updates and log viewing.
 */
const ModelManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [modelStatus, setModelStatus] = useState({ status: 'inactive', lastUpdated: null }); // Added model status state
  
  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (message && message.type === 'error') {
      timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message]);
  const [nextUpdate, setNextUpdate] = useState(null);
  const [logs, setLogs] = useState(null);
  const navigate = useNavigate();
  
  /**
   * Handle authentication errors
   */
  const handleAuthError = useCallback((error) => {
    // Check if the error is related to authentication
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirect to login page
      console.error("Sesión expirada o no autorizada:", error.response.data);
      navigate('/');
      return true;
    }
    return false;
  }, [navigate]);

  /**
   * Fetch logs from the last model update
   */  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);      
      const response = await axios.get('http://localhost:5000/ml/logs', {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      if (!handleAuthError(error)) {
        console.error("Error fetching logs:", error);
        // Don't show error message for 404 (no logs found) as this is an expected state
        if (error.response && error.response.status === 404) {
          setLogs({ logFile: null, logContent: null }); // Set empty logs state
        } else {
          // Only show error message for unexpected errors
          setMessage({
            type: 'error',
            text: 'Error al obtener logs: ' + 
                  (error.response?.data?.message || error.message)
          });
        }
      }
      setLoading(false);
    }
  }, [handleAuthError]);

  /**
   * Fetch the current status of the model
   */
  const fetchModelStatus = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/ml/status', {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setModelStatus(response.data);
    } catch (error) {
      if (!handleAuthError(error)) {
        console.error("Error fetching model status:", error);
        // Don't show error message as this is non-critical
        // Fall back to default state (inactive)
        setModelStatus({ status: 'inactive', lastUpdated: null });
      }
    }
  }, [handleAuthError]);

  /**
   * Fetch information about the next scheduled update
   */  const fetchScheduleInfo = useCallback(async () => {
    try {
      setLoading(true);      
      const response = await axios.get('http://localhost:5000/ml/schedule', {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setNextUpdate(response.data.schedule);
      setLoading(false);
    } catch (error) {
      if (!handleAuthError(error)) {
        console.error("Error fetching schedule info:", error);
        // Don't show error message for 404 (no schedule found) as this is an expected state
        if (error.response && error.response.status === 404) {
          setNextUpdate(null); // Set empty schedule state
        } else {
          // Only show error message for unexpected errors
          setMessage({
            type: 'error',
            text: 'Error al obtener información de programación: ' + 
                  (error.response?.data?.message || error.message)
          });
        }
      }
      setLoading(false);
    }
  }, [handleAuthError]);  // Ya no se necesita toggleModelStatus porque el estado del modelo es solo informativo

  /**
   * Trigger a manual model update
   */
  const runManualUpdate = useCallback(async () => {
    try {
      setLoading(true);      const response = await axios.post('http://localhost:5000/ml/update', {}, {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setMessage({
        type: 'success',
        text: response.data.message
      });
      // Refresh data after update
      await fetchLogs();
      await fetchModelStatus(); // Also refresh model status
      setLoading(false);
    } catch (error) {
      if (!handleAuthError(error)) {
        setMessage({
          type: 'error',
          text: 'Error al iniciar actualización: ' + 
                (error.response?.data?.message || error.message)
        });
      }
      setLoading(false);
    }
  }, [handleAuthError, fetchLogs, fetchModelStatus]);
  
  // Check authenticated session and fetch schedule information on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {        
        // Clear any previous error messages
        setMessage(null);
        
        // Verify user session before proceeding
        const sessionResponse = await axios.get('http://localhost:5000/users/getSession', {
          withCredentials: true
          // Removidos los headers que causan problemas con CORS
        });
        
        // Check if user has admin role
        const userRole = sessionResponse.data?.usuario?.rol;
        if (!userRole || userRole !== 'admin') {
          console.error("Access denied: User is not an admin");
          navigate('/');
          return;
        }
          // If session is valid and user is admin, fetch all model data
        fetchScheduleInfo();
        fetchLogs(); // Cargar logs automáticamente al inicio
        fetchModelStatus(); // Cargar el estado del modelo
      } catch (error) {
        console.error("Session validation error:", error);
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate, fetchScheduleInfo, fetchLogs, fetchModelStatus]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <MasterLayout role="admin">
      <div id="modelManagementAdmin">        <div className="card mb-4">          <div className="card-header bg-white border-bottom pb-2">
            <h5 className="mb-0">Gestión de Modelo de Predicción</h5>
          </div>          <div className="card-body py-2 ps-1">
            {/* Indicador de estado del modelo */}
            <div className={`alert ${modelStatus.status === 'active' ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-2 py-2 mx-1`}>
              <i className={`bi bi-circle-fill ${modelStatus.status === 'active' ? 'text-success' : 'text-danger'} me-2`} style={{ fontSize: '0.8rem' }}></i>
              <div>
                <span className="fw-semibold small">Estado del modelo:</span> 
                <span className="small ms-1">{modelStatus.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                {modelStatus.lastUpdated && (
                  <small className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
                    (Última actualización: {new Date(modelStatus.lastUpdated).toLocaleDateString()})
                  </small>
                )}
              </div>
            </div>
            
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mb-2`} role="alert">
                {message.text}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMessage(null)} 
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>
        </div>
        
        <div className="row">
          {/* Schedule information card */}
          <div className="col-xl-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Programación de Actualización</h5>
              </div>
              <div className="card-body">
                {loading && !nextUpdate ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : nextUpdate ? (
                  <div>
                    <div className="mb-3">
                      <strong className="d-block mb-1">Día programado:</strong>
                      <span className="text-secondary">{nextUpdate.day}</span>
                    </div>
                    <div className="mb-3">
                      <strong className="d-block mb-1">Hora programada:</strong>
                      <span className="text-secondary">{nextUpdate.hour}</span>
                    </div>
                    <div className="mb-4">
                      <strong className="d-block mb-1">Próxima ejecución:</strong>
                      <span className="text-secondary">{formatDate(nextUpdate.nextRun)}</span>
                    </div>
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={runManualUpdate}
                      disabled={loading}
                    >
                      {loading ? 'Iniciando...' : 'Ejecutar Actualización Ahora'}
                    </button>
                  </div>
                ) : (
                  <p className="mb-0">No se pudo obtener información de programación</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Logs card */}
          <div className="col-xl-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Logs de Actualización</h5>
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={fetchLogs} 
                  disabled={loading}
                  title="Actualizar logs"
                >
                  <i className="bi bi-arrow-clockwise"></i> {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando logs...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando logs...</p>
                  </div>
                ) : logs && logs.logContent ? (
                  <div>
                    <p><strong>Archivo:</strong> {logs.logFile}</p>
                    <div className="bg-dark text-light p-3 mt-3" style={{ maxHeight: '400px', overflow: 'auto', borderRadius: '4px' }}>
                      <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{logs.logContent}</pre>
                    </div>
                  </div>                ) : (
                  <div className="text-center py-5 px-3 bg-light rounded" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <p className="text-muted mt-4 mb-0">No hay logs disponibles para mostrar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Information about the model */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Acerca del Modelo de Predicción</h5>
              </div>              <div className="card-body">
                <div className="card-text">
                  <h6 className="mb-3">Modelo HybridGradientBoostingTree de Predicción de Stock Mínimo</h6>
                  
                  <div className="mb-4">
                    <h6 className="text-primary mb-2"><i className="bi bi-diagram-3"></i> Arquitectura del Modelo</h6>
                    <p>Implementación avanzada basada en HybridGradientBoostingTree con preprocesamiento mediante biblioteca hana-ml. El modelo combina técnicas de árboles de decisión y boosting para optimizar la predicción de stock mínimo.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-primary mb-2"><i className="bi bi-bar-chart-line"></i> Variables Principales</h6>
                    <p><strong>Variable objetivo:</strong> <code>demanda_mensual</code></p>
                    <p><strong>Predictores clave:</strong></p>
                    <ul className="mb-3">
                      <li><code>historial_ventas</code> (últimos 6 meses)</li>
                      <li><code>temporada</code> (factor estacional)</li>
                      <li><code>dias_reposicion</code> (lead time del proveedor)</li>
                      <li><code>precio</code> (elasticidad de demanda)</li>
                      <li><code>tendencia_categoria</code> (análisis de mercado)</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-primary mb-2"><i className="bi bi-gear"></i> Pipeline de Procesamiento</h6>
                    <ol className="mb-3">
                      <li>Extracción de datos históricos de ventas</li>
                      <li>Preprocesamiento y normalización con hana-ml</li>
                      <li>Feature engineering y selección de variables</li>
                      <li>Entrenamiento del modelo HybridGradientBoostingTree</li>
                      <li>Validación con datos históricos (RMSE, MAE)</li>
                      <li>Predicción y cálculo de stock mínimo óptimo</li>
                      <li>Actualización automática en base de datos</li>
                    </ol>
                  </div>
                    <div className="row align-items-start">                    <div className="col-12 mb-4">
                      <h6 className="text-primary mb-2"><i className="bi bi-calendar-check"></i> Parámetros Operativos</h6>
                      <ul className="mb-0">
                        <li>Entrenamiento mensual con datos actualizados</li>
                        <li>Predicción de demanda para los próximos 2 meses</li>
                        <li>Factor de seguridad dinámico (15%-25%) según categoría</li>
                        <li>Margen de error promedio: 8% (MAPE)</li>
                        <li>Monitoreo continuo con reentrenamiento mensual automático</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default ModelManagement;
