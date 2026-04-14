import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Providers } from "@/app/providers";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouter } from "@/app/router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
