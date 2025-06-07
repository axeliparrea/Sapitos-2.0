import {
    Dialog,
    FlexBox,
  } from "@ui5/webcomponents-react";
  import { Icon } from "@iconify/react";
  
  const ErrorDialog = ({ open, onClose, errorMessage }) => {
    return (
      <Dialog
        open={open}
        onAfterClose={onClose}
        style={{
          width: "400px",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "0",
          overflow: "hidden"
        }}
        onClose={onClose}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 20px 12px 20px", // <-- más espacio abajo
          borderBottom: "2px solid #eee"
        }}>
          <span style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#333"
          }}>
            Error de inicio de sesión
          </span>
          <Icon
            icon="mdi:close"
            style={{ 
              cursor: "pointer",
              fontSize: "23px",
              color: "#666"
            }}
            onClick={onClose}
          />
        </div>
  
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px 20px",
          gap: "24px"
        }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#FF0000",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Icon
              icon="mdi:close"
              style={{
                fontSize: "40px",
                color: "white"
              }}
            />
          </div>
  
          <p style={{
            margin: "0",
            textAlign: "center",
            color: "#333",
            fontSize: "15px",
            maxWidth: "280px"
          }}>
            {errorMessage || "Ha ocurrido un error al intentar iniciar sesión"}
          </p>
        </div>
      </Dialog>
    );
  };
  
  export default ErrorDialog;
  