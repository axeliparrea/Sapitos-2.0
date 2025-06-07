import { useState } from "react";
import {
  Dialog,
  Button,
  Bar,
  Title,
  MessageStrip,
  Input,
  Label,
  FlexBox,
  TextArea
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";

const UI5Dialog = ({ open, onClose, title = "Título del Dialog" }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: ""
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    console.log("Datos del formulario:", formData);
    // Aquí puedes manejar el envío de datos
    onClose();
  };

  return (
    <Dialog
      open={open}
      onAfterClose={onClose}
      style={{ width: "500px" }}
      footer={
        <Bar
          endContent={
            <>
              <Button design="Emphasized" onClick={handleSubmit}>
                Guardar
              </Button>
              <Button design="Transparent" onClick={onClose}>
                Cancelar
              </Button>
            </>
          }
        />
      }
      header={
        <Bar>
          <Title>{title}</Title>
        </Bar>
      }
    >
      <FlexBox direction="Column" style={{ gap: "1rem", padding: "1rem" }}>
        <MessageStrip design="Information">
          Complete todos los campos requeridos (*)
        </MessageStrip>

        <FlexBox direction="Column" style={{ gap: "0.5rem" }}>
          <Label for="nombre" required>
            Nombre
          </Label>
          <Input
            id="nombre"
            placeholder="Ingrese un nombre"
            value={formData.nombre}
            onChange={handleInputChange}
          />
        </FlexBox>

        <FlexBox direction="Column" style={{ gap: "0.5rem" }}>
          <Label for="descripcion">
            Descripción
          </Label>
          <TextArea
            id="descripcion"
            placeholder="Ingrese una descripción"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={4}
          />
        </FlexBox>
      </FlexBox>
    </Dialog>
  );
};

export default UI5Dialog; 