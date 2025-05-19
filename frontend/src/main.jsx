import { createRoot } from "react-dom/client";

// Solo los estilos necesarios que ya estás usando
import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/css/jsvectormap.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

// Configuración de SAP UI5
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { setNoConflict } from "@ui5/webcomponents-base/dist/config/NoConflict.js";
import { setAnimationMode } from "@ui5/webcomponents-base/dist/config/AnimationMode.js";

// Importación de temas y recursos base
import "@ui5/webcomponents-theming/dist/Assets.js";
import "@ui5/webcomponents-react/dist/Assets.js";
import "@ui5/webcomponents/dist/Assets.js";

// Configuración global de SAP UI5
setTheme("sap_horizon");
setLanguage("es");
setNoConflict(true); 

// Íconos SAP UI5 (necesarios para MessageBox con íconos)
import "@ui5/webcomponents-icons/dist/AllIcons.js";

// Solo los componentes necesarios para alertas
import "@ui5/webcomponents/dist/Toast.js";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <App />
  </>
);
