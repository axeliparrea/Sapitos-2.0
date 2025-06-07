import { useState } from "react";
import { Button } from "@ui5/webcomponents-react";
import UI5Dialog from "./UI5Dialog";

const DialogExample = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Button onClick={handleOpenDialog}>Abrir Dialog</Button>
      
      <UI5Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Ejemplo de Dialog UI5"
      />
    </div>
  );
};

export default DialogExample; 