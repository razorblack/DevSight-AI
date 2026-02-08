import { TamboRegistryProvider } from "@tambo-ai/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { tamboComponents } from "./renderer/tamboComponents";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TamboRegistryProvider components={tamboComponents}>
      <App />
    </TamboRegistryProvider>
  </StrictMode>,
)
