"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

/**
 * Home page component that renders the Tambo chat interface.
 *
 * @remarks
* By default this page points Tambo's SDK at the local proxy route (`/api/tambo`).
*
* You can override it with `NEXT_PUBLIC_TAMBO_URL` (must be an absolute URL),
* which is useful when running a custom Tambo server.
 *
 * @see {@link https://github.com/tambo-ai/tambo/blob/main/CONTRIBUTING.md} for instructions on running the API server locally.
 */
export default function Home() {
  // Load MCP server configurations
  const mcpServers = useMcpServers();
  const tamboUrl =
    process.env.NEXT_PUBLIC_TAMBO_URL ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/api/tambo`
      : undefined);

  return (
    <TamboProvider
      apiKey="proxy"
      components={components}
      tools={tools}
      tamboUrl={tamboUrl}
      mcpServers={mcpServers}
    >
      <div className="h-screen">
        <MessageThreadFull className="max-w-4xl mx-auto"/>
      </div>
    </TamboProvider>
  );
}
