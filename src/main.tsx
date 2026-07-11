import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PreviewApp } from "./preview/App";
import "./tokens/global.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PreviewApp />
    </BrowserRouter>
  </StrictMode>,
);
