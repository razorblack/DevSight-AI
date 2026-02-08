import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // NOTE: `useTamboRegistry` isn't exported from `@tambo-ai/react`'s public entrypoint.
      // For this hackathon MVP we alias a stable internal path so we can access the
      // registered component list for schema-driven rendering.
      '@tambo-ai/react/internal-registry': resolve(
        __dirname,
        'node_modules/@tambo-ai/react/esm/providers/tambo-registry-provider.js',
      ),
    },
  },
})
