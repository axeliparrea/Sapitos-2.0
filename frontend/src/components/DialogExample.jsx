import { useState } from "react";
import { Button, FlexBox } from "@ui5/webcomponents-react";
import UI5Dialog from "./UI5Dialog";
import { notify, NotificationType } from "./NotificationService";

const DialogExample = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    notify("Dialog abierto", NotificationType.INFO, true); // Usando UI5 MessageToast
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    notify("Dialog cerrado", NotificationType.INFO); // Usando react-toastify
  };

  const showNotificationExamples = () => {
    // Ejemplos de diferentes tipos de notificaciones
    notify("¡Operación exitosa!", NotificationType.SUCCESS);
    setTimeout(() => {
      notify("¡Advertencia!", NotificationType.WARNING);
    }, 1000);
    setTimeout(() => {
      notify("¡Error en la operación!", NotificationType.ERROR);
    }, 2000);
    setTimeout(() => {
      notify("Información importante", NotificationType.INFO, true); // UI5
    }, 3000);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <FlexBox direction="Column" style={{ gap: "1rem" }}>
        <Button onClick={handleOpenDialog}>Abrir Dialog</Button>
        <Button onClick={showNotificationExamples}>Mostrar Ejemplos de Notificaciones</Button>
      </FlexBox>
      
      <UI5Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Ejemplo de Dialog UI5"
      />
    </div>
  );
};

export default DialogExample; 