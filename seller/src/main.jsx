import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SellerProvider } from "./context/SellerContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SellerProvider>
      <App />
    </SellerProvider>
  </BrowserRouter>,
);
