import { toast } from "react-toastify";

// Tipos de notificación
export const NotificationType = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info"
};

// Configuración por defecto para react-toastify
const toastConfig = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  style: { 
    textAlign: "center",
    minWidth: "300px"
  }
};

// Función principal para mostrar notificaciones
export const notify = (message, type = NotificationType.INFO) => {
  switch (type) {
    case NotificationType.SUCCESS:
      toast.success(message, toastConfig);
      break;
    case NotificationType.ERROR:
      toast.error(message, toastConfig);
      break;
    case NotificationType.WARNING:
      toast.warning(message, toastConfig);
      break;
    case NotificationType.INFO:
    default:
      toast.info(message, toastConfig);
      break;
  }
}; 