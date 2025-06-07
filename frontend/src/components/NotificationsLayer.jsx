import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import axios from "axios";
import { notify } from "./NotificationService";

const Alert = ({ type, title, description, onDelete }) => {
  const typeClass = {
    primary: 'bg-primary-50 text-primary-600 border-primary-50',
    success: 'bg-success-100 text-success-600 border-success-100',
    danger: 'bg-danger-100 text-danger-600 border-danger-100',
  }[type] || 'bg-base text-neutral-800 border-base';

  const textColor = typeClass.split(' ')[1];

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
    </div>
  );
};

const NotificationsLayer = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al backend
      const mockNotifications = [
        {
          id: 1,
          type: 'danger',
          title: 'No se ha podido registrar al usuario',
          description: 'Hubo un error al registrar el usuario. Inténtalo de nuevo más tarde o revisa los datos proporcionados.',
        },
        {
          id: 2,
          type: 'success',
          title: 'Pedido enviado correctamente',
          description: 'El pedido fue registrado y enviado al sistema exitosamente. Puedes verlo en el historial.',
        },
        {
          id: 3,
          type: 'danger',
          title: 'No se ha podido enviar el pedido',
          description: 'Hubo un error al intentar enviar el pedido. Verifica la conexión o contacta al administrador.',
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      notify('Error al cargar las notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      // TODO: Implementar llamada al backend para eliminar
      setNotifications(notifications.filter(notif => notif.id !== id));
      notify('Notificación eliminada', 'success');
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
      notify('Error al eliminar la notificación', 'error');
    }
  };

  return (
    <div className='col-lg-12'>
      <div className='card h-100 p-0'>
        <div className='card-header border-bottom bg-base py-16 px-24'>
          <h6 className='text-lg fw-semibold mb-0'>Notificaciones</h6>
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
                type={notification.type}
                title={notification.title}
                description={notification.description}
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
