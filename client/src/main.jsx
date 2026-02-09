import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClientProvider } from "./context/ClientContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClientProvider>
      <App />
    </ClientProvider>
  </BrowserRouter>,
);
