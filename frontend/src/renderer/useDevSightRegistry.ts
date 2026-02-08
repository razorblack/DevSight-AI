import { useTamboRegistry } from "@tambo-ai/react/internal-registry";

// NOTE: This import is wired via a Vite alias to an internal file inside
// `@tambo-ai/react`. For this hackathon MVP we use it to access the registered
// component list for schema-driven rendering.
export function useDevSightRegistry() {
  const ctx = useTamboRegistry();
  if (!ctx?.componentList) {
    throw new Error(
      "Tambo registry is unavailable. Check the Vite alias for '@tambo-ai/react/internal-registry'.",
    );
  }
  return ctx;
}
