declare module "@tambo-ai/react/internal-registry" {
  import type { ComponentRegistry } from "@tambo-ai/react";

  // NOTE: This is not a public export from `@tambo-ai/react`.
  // We wire it up via a Vite alias to access the registry for schema-driven rendering.

  export interface TamboRegistryContext {
    componentList: ComponentRegistry;
  }

  export function useTamboRegistry(): TamboRegistryContext;
}
