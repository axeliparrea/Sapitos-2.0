import { createRoot } from "react-dom/client";

import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/css/jsvectormap.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import 'bootstrap/dist/css/bootstrap.min.css';
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

// SAP UI5
import "@ui5/webcomponents-react/dist/Assets.js"; 
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";


// errores x
if (typeof window !== 'undefined') {
  window['sap-ui-webcomponents-bundle'] = {
    configuration: {
      noConflict: true
    }
  };
}

setTheme("sap_horizon");
setLanguage("es");

import App from "./App.jsx";


createRoot(document.getElementById("root")).render(
  <>
    <App />
  </>
);
