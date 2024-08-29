import React from "react";
import ReactDOM from "react-dom/client";
import { CesiumApp } from "./CesiumApp.tsx";
import { App } from "./Openlayers/App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  // <CesiumApp />,
  <App/>
  // </React.StrictMode>,
);
