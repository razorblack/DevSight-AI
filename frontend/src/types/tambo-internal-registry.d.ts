declare module "@tambo-ai/react/internal-registry" {
  import type { ComponentRegistry } from "@tambo-ai/react";

  export interface TamboRegistryContext {
    componentList: ComponentRegistry;
  }

  export function useTamboRegistry(): TamboRegistryContext;
}
