import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { loadSettings } from "./lib/storage";
import "./index.css";
import App from "./App";

if (loadSettings().darkMode) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
