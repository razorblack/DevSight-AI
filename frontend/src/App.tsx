import { useMemo, useState } from "react";

import { EmptyState } from "./components";
import { TamboSchemaRenderer } from "./renderer/TamboSchemaRenderer";
import type { GenerateUiResponse } from "./schemas/uiSchema";
import { SUPPORTED_PROMPTS } from "../../shared/prompts";

export default function App() {
  const backendUrl = useMemo(() => {
    const env = import.meta.env.VITE_BACKEND_URL;
    return typeof env === "string" && env.trim().length > 0
      ? env.trim()
      : "http://localhost:3001";
  }, []);

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateUiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextPrompt?: string) {
    const finalPrompt = (nextPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    setPrompt(finalPrompt);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/generate-ui`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }

      const json = (await res.json()) as GenerateUiResponse;
      setResult(json);
    } catch (e) {
      const rawMessage = e instanceof Error ? e.message : "Unknown error";

      if (e instanceof TypeError && rawMessage.includes("fetch")) {
        setError(
          `Could not reach backend at ${backendUrl}. Is the backend running? (VITE_BACKEND_URL optional)`
        );
      } else {
        setError(rawMessage);
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            DevSight AI
          </h1>
          <p className="text-sm text-slate-300">
            Ask your system. The UI answers.
          </p>
        </header>

        <form
          className="mt-6 flex flex-col gap-3 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={SUPPORTED_PROMPTS[0]}
            className="w-full flex-1 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Generating…" : "Generate UI"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUPPORTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void submit(p)}
              disabled={isLoading}
              className="rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-900/60 disabled:opacity-60"
            >
              {p}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <main className="mt-8">
          {isLoading ? (
            <EmptyState
              title="Generating UI…"
              description="The backend is mapping your prompt to a UI schema + mock data."
            />
          ) : result ? (
            <TamboSchemaRenderer schema={result.schema} data={result.data} />
          ) : (
            <EmptyState
              title="Start with a prompt"
              description="Try one of the supported prompts to see the dashboard UI change dynamically."
            />
          )}
        </main>
      </div>
    </div>
  );
}
