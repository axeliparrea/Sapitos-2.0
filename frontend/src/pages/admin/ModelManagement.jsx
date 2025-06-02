import React, { useState, useEffect } from 'react';
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
  const [nextUpdate, setNextUpdate] = useState(null);
  const [logs, setLogs] = useState(null);
  const navigate = useNavigate();
    // Check authenticated session and fetch schedule information on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verify user session before proceeding
        const sessionResponse = await axios.get('http://localhost:5000/users/getSession', {
          withCredentials: true
        });
        
        // Check if user has admin role
        if (!sessionResponse.data?.usuario?.rol || sessionResponse.data.usuario.rol !== 'admin') {
          console.error("Access denied: User is not an admin");
          navigate('/');
          return;
        }
        
        // If session is valid and user is admin, fetch the schedule info
        fetchScheduleInfo();
      } catch (error) {
        console.error("Session validation error:", error);
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  /**
   * Fetch information about the next scheduled update
   */  const handleAuthError = (error) => {
    // Check if the error is related to authentication
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirect to login page
      console.error("Sesión expirada o no autorizada:", error.response.data);
      navigate('/');
      return true;
    }
    return false;
  };

  const fetchScheduleInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/ml/schedule', {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setNextUpdate(response.data.schedule);
      setLoading(false);
    } catch (error) {
      if (!handleAuthError(error)) {
        setMessage({
          type: 'error',
          text: 'Error al obtener información de programación: ' + 
                (error.response?.data?.message || error.message)
        });
      }
      setLoading(false);
    }
  };
  
  /**
   * Fetch logs from the last model update
   */  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/ml/logs', {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      if (!handleAuthError(error)) {
        setMessage({
          type: 'error',
          text: 'Error al obtener logs: ' + 
                (error.response?.data?.message || error.message)
        });
      }
      setLoading(false);
    }
  };
  
  /**
   * Trigger a manual model update
   */  const runManualUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/ml/update', {}, {
        withCredentials: true // Include credentials (cookies) with the request
      });
      setMessage({
        type: 'success',
        text: response.data.message
      });
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
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <MasterLayout role="admin">
      <div id="modelManagementAdmin">
        <div className="card mb-4">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0">Gestión de Modelo de Predicción</h5>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`} role="alert">
                {message.text}
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
              <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">Logs de Actualización</h5>
              </div>
              <div className="card-body">
                <button
                  className="btn btn-secondary mb-3"
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Ver Últimos Logs'}
                </button>
                
                {logs && (
                  <div>
                    <p><strong>Archivo:</strong> {logs.logFile}</p>
                    <div className="bg-dark text-light p-3 mt-3" style={{ maxHeight: '400px', overflow: 'auto' }}>
                      <pre className="mb-0">{logs.logContent}</pre>
                    </div>
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
              </div>
              <div className="card-body">
                <div className="card-text">
                  <h6>Modelo de Predicción de Stock Mínimo</h6>
                  <p>El modelo utiliza XGBoost para predecir la demanda futura de productos y actualizar automáticamente los valores de stock mínimo en la base de datos.</p>
                  <hr />
                  <p className="mb-2">Características principales:</p>
                  <ul>
                    <li>Entrenamiento semanal con datos actualizados</li>
                    <li>Predicción de demanda para la semana siguiente</li>
                    <li>Actualización automática de valores de stock_minimo</li>
                    <li>Factor de seguridad del 20% para prevenir faltantes</li>
                  </ul>
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
