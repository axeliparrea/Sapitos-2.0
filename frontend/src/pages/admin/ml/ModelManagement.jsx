import React, { useState, useEffect } from 'react';
import axios from 'axios';
import masterLayout from '../../../components/masterLayout';
import SortableComponent from '../../../helper/SortableTask';

/**
 * ML Model Management Component
 * 
 * Allows administrators to manage the stock prediction model,
 * including triggering manual updates and viewing logs.
 */
function ModelManagementPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [nextUpdate, setNextUpdate] = useState(null);
    const [logs, setLogs] = useState(null);
    
    // Fetch schedule information on component mount
    useEffect(() => {
        fetchScheduleInfo();
    }, []);
    
    /**
     * Fetch information about the next scheduled update
     */
    const fetchScheduleInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/ml/schedule`);
            setNextUpdate(response.data.schedule);
            setLoading(false);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error al obtener información de programación: ' + 
                      (error.response?.data?.message || error.message)
            });
            setLoading(false);
        }
    };
    
    /**
     * Fetch logs from the last model update
     */
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/ml/logs`);
            setLogs(response.data);
            setLoading(false);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error al obtener logs: ' + 
                      (error.response?.data?.message || error.message)
            });
            setLoading(false);
        }
    };
    
    /**
     * Trigger a manual model update
     */
    const runManualUpdate = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/ml/update`);
            setMessage({
                type: 'success',
                text: response.data.message
            });
            setLoading(false);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Error al iniciar actualización: ' + 
                      (error.response?.data?.message || error.message)
            });
            setLoading(false);
        }
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box d-flex align-items-center justify-content-between">
                                <h4 className="mb-0">Gestión de Modelo de Predicción</h4>
                            </div>
                        </div>
                    </div>
                    
                    {/* Alert message */}
                    {message && (
                        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`} role="alert">
                            {message.text}
                        </div>
                    )}
                    
                    {/* Schedule information card */}
                    <div className="row">
                        <div className="col-xl-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="card-title mb-4">Programación de Actualización</h4>
                                    
                                    {loading && !nextUpdate ? (
                                        <div className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </div>
                                    ) : nextUpdate ? (
                                        <div>
                                            <p><strong>Día programado:</strong> {nextUpdate.day}</p>
                                            <p><strong>Hora programada:</strong> {nextUpdate.hour}</p>
                                            <p><strong>Próxima ejecución:</strong> {formatDate(nextUpdate.nextRun)}</p>
                                            
                                            <button 
                                                className="btn btn-primary mt-3" 
                                                onClick={runManualUpdate}
                                                disabled={loading}
                                            >
                                                {loading ? 'Iniciando...' : 'Ejecutar Actualización Ahora'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p>No se pudo obtener información de programación</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Logs card */}
                        <div className="col-xl-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="card-title mb-4">Logs de Actualización</h4>
                                    
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
                                                <pre>{logs.logContent}</pre>
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
                                <div className="card-body">
                                    <h4 className="card-title mb-4">Acerca del Modelo de Predicción</h4>
                                    
                                    <div className="alert alert-info" role="alert">
                                        <h5 className="alert-heading">Modelo de Predicción de Stock Mínimo</h5>
                                        <p>El modelo utiliza XGBoost para predecir la demanda futura de productos y actualizar automáticamente los valores de stock mínimo en la base de datos.</p>
                                        <hr />
                                        <p className="mb-0">Características principales:</p>
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
            </div>
        </div>
    );
}

export default masterLayout(ModelManagementPage);
