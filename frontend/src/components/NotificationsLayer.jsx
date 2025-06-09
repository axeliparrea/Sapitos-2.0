import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from "axios";
import { notify, NotificationType } from "./NotificationService";
import { useNavigate } from "react-router-dom";

// Función para formatear fecha de manera amigable
const formatearFechaRelativa = (fechaStr) => {
  if (!fechaStr) return '';
  
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diferencia = ahora - fecha;
  
  // Si es inválida, retornar string vacío
  if (isNaN(fecha.getTime())) return '';
  
  // Menos de un minuto
  if (diferencia < 60 * 1000) {
    return 'hace unos segundos';
  }
  
  // Menos de una hora
  if (diferencia < 60 * 60 * 1000) {
    const minutos = Math.floor(diferencia / (60 * 1000));
    return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Menos de un día
  if (diferencia < 24 * 60 * 60 * 1000) {
    const horas = Math.floor(diferencia / (60 * 60 * 1000));
    return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }
  
  // Menos de una semana
  if (diferencia < 7 * 24 * 60 * 60 * 1000) {
    const dias = Math.floor(diferencia / (24 * 60 * 60 * 1000));
    return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
  
  // Formatear fecha completa
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};



const Alert = ({ type, title, description, fecha, orden_id, usuario_id, onDelete }) => {
  const navigate = useNavigate();
  const typeClass = {
    primary: 'bg-primary-50 text-primary-600 border-primary-50',
    success: 'bg-success-100 text-success-600 border-success-100',
    danger: 'bg-danger-100 text-danger-600 border-danger-100',
    warning: 'bg-warning-100 text-warning-600 border-warning-100',
    info: 'bg-info-100 text-info-600 border-info-100',
  }[type] || 'bg-base text-neutral-800 border-base';

  const textColor = typeClass.split(' ')[1];
  
  // Formatear la fecha de manera relativa
  const fechaFormateada = formatearFechaRelativa(fecha);

  // Determinar si es una notificación de pedido por la descripción
  const esPedido = orden_id || description.includes('Orden #') || description.includes('orden #') || 
                  description.includes('pedido') || description.includes('Pedido');
  
  // Extraer el ID de la orden de la descripción si no viene explícito
  let ordenIdFromDesc = null;
  if (!orden_id && esPedido) {
    const match = description.match(/[Oo]rden #?(\d+)/);
    if (match && match[1]) {
      ordenIdFromDesc = match[1];
    }
  }

  const handleClick = () => {
    // Solo navegar si es un pedido
    if (orden_id) {
      navigate(`/admin/pedidos/detalle/${orden_id}`);
    } else if (ordenIdFromDesc) {
      navigate(`/admin/pedidos/detalle/${ordenIdFromDesc}`);
    } else if (usuario_id) {
      navigate(`/admin/usuarios`);
    }
  };

  return (
    <div
      className={`alert ${typeClass} px-24 py-11 mb-0 fw-semibold text-lg radius-8`}
      role='alert'
    >
      <div className='d-flex align-items-center justify-content-between text-lg'>
        {title}
        <button 
          className={`remove-button ${textColor} text-xxl line-height-1`}
          onClick={onDelete}
        >
          <Icon icon='iconamoon:sign-times-light' className='icon' />
        </button>
      </div>
      <p className={`fw-medium ${textColor} text-sm mt-8`}>{description}</p>
      
      <div className="d-flex justify-content-between align-items-center mt-8">
        <small className={`${textColor} text-xs`}>{fechaFormateada}</small>
        
        {/* Solo mostrar enlace si es una notificación de pedido */}
        {(esPedido && (orden_id || ordenIdFromDesc)) && (
          <button 
            className={`btn btn-sm ${textColor} text-xs fw-medium`}
            onClick={handleClick}
          >
            Ver Pedido
            <Icon icon="heroicons:arrow-small-right" className="ms-1" />
          </button>
        )}
      </div>
    </div>
  );
};

const NotificationsLayer = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://sapitos-backend.cfapps.us10-001.hana.ondemand.com";

  useEffect(() => {
    fetchNotifications();
    
    // Configurar intervalo para actualizar las notificaciones cada 2 minutos
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
    
    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener datos del backend
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      
      // Siempre intentar obtener datos reales
      try {
        // Usar endpoint directo para pruebas
        console.log("Intentando obtener notificaciones...");
        
        // Primero intentar crear alertas de prueba si no hay
        try {
          await axios.get(`${API_BASE_URL}/alertas/create-test-alerts`);
          console.log("Alertas de prueba creadas");
        } catch (error) {
          console.log("No se pudieron crear alertas de prueba:", error.message);
        }
        
        // Luego obtener las alertas
        let url = `${API_BASE_URL}/alertas/test-get`;
        
        console.log('Conectando al endpoint:', url);
        
        const response = await axios.get(url);
        console.log('Respuesta del servidor:', response);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Datos recibidos del backend:', response.data);
          
          // Procesar los datos para asegurar el formato correcto
          const processedData = response.data.map(item => {
            // Si ya tiene el formato correcto, usarlo directamente
            if (item.tipo && item.titulo && item.descripcion) {
              return item;
            }
            
            // Si es un formato raw de la BD, convertirlo
            let tipo = 'primary'; // Por defecto
            const descripcion = item.descripcion || item.Descripcion || '';
            
            if (descripcion.includes('Error') || 
                descripcion.includes('error') || 
                descripcion.includes('fallo') ||
                descripcion.includes('stock') ||
                descripcion.includes('bajo') ||
                descripcion.includes('agotará')) {
              tipo = 'danger';
            } else if (descripcion.includes('Completado') || 
                      descripcion.includes('aceptada') ||
                      descripcion.includes('exitosa')) {
              tipo = 'success';
            } else if (descripcion.includes('importada')) {
              tipo = 'primary';
            } else if (descripcion.includes('retrasada')) {
              tipo = 'warning';
            } else if (descripcion.includes('exportada')) {
              tipo = 'info';
            }
            
            // Extraer IDs si existen
            const ordenIdMatch = descripcion.match(/[Oo]rden #?(\d+)/);
            const ordenId = ordenIdMatch ? ordenIdMatch[1] : null;
            
            // Crear título conciso
            let titulo = descripcion;
            if (descripcion.includes('Inventario bajo') || descripcion.includes('stock')) {
              titulo = 'Inventario bajo';
            } else if (descripcion.includes('aceptada')) {
              titulo = 'Pedido completado';
            } else if (descripcion.includes('importadas')) {
              titulo = 'Nueva importación de inventario';
            } else if (descripcion.includes('retrasada')) {
              titulo = 'Retraso en pedido';
            } else if (descripcion.includes('exportadas')) {
              titulo = 'Exportación de producto';
            }
            
            return {
              id: item.id || item.Alerta_ID,
              tipo,
              titulo,
              descripcion,
              fecha: item.fecha || item.FechaCreacion || new Date().toISOString(),
              orden_id: ordenId,
              location_id: item.location_id || item.Location_ID
            };
          });
          
          setNotifications(processedData);
          
          // Si teníamos datos de prueba antes pero ahora recibimos datos reales
          if (usingMockData) {
            setUsingMockData(false);
            notify('Usando datos reales para notificaciones', NotificationType.SUCCESS);
          }
        } else {
          throw new Error('No se recibieron datos válidos');
        }
      } catch (error) {
        console.error('Error conectando al backend:', error.message);
        
        // Sólo usar datos de prueba si realmente no hay otra opción
        if (!usingMockData) {
          setNotifications(mockNotifications);
          setUsingMockData(true);
          notify('No se pudo conectar a la base de datos - usando datos de prueba', NotificationType.WARNING);
        }
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      notify('Error al cargar las notificaciones', NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      if (!usingMockData) {
        await axios.delete(`${API_BASE_URL}/alertas/${id}`, {
          withCredentials: true
        });
      }
      
      setNotifications(notifications.filter(notif => notif.id !== id));
      notify('Notificación eliminada', NotificationType.SUCCESS);
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
      notify('Error al eliminar la notificación', NotificationType.ERROR);
      
      // Si estamos en modo mock, eliminarla de todas formas
      if (usingMockData) {
        setNotifications(notifications.filter(notif => notif.id !== id));
      }
    }
  };

  return (
    <div className='col-lg-12'>
      <div className='card h-100 p-0'>
        <div className='card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between align-items-center'>
          <h6 className='text-lg fw-semibold mb-0'>
            Notificaciones
            {usingMockData && <span className="badge bg-warning text-white ms-2 text-xs">Datos de prueba</span>}
          </h6>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <Icon icon="mdi:refresh" className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className='card-body p-24 d-flex flex-column gap-4'>
          {loading ? (
            <div className="text-center py-4">
              <Icon icon="mdi:loading" className="text-primary text-4xl animate-spin" />
              <p className="mt-2">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4">
              <Icon icon="mdi:bell-off-outline" className="text-muted text-4xl mb-2" />
              <p className="text-muted">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map(notification => (
              <Alert
                key={notification.id}
                type={notification.tipo}
                title={notification.titulo}
                description={notification.descripcion}
                fecha={notification.fecha}
                orden_id={notification.orden_id}
                usuario_id={notification.usuario_id}
                onDelete={() => handleDeleteNotification(notification.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsLayer;
