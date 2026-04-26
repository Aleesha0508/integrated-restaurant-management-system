import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AppShellProvider } from "./context/AppShellContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppShellProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppShellProvider>
  </React.StrictMode>,
);
