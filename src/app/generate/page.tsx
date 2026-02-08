"use client";

import { generateUiSchema, type GenerateUiSchemaResult } from "@/lib/ui-schema-generator";
import { AlertCircle, Loader2, CheckCircle2, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect, useId } from "react";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateUiSchemaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isSchemaPanelExpanded, setIsSchemaPanelExpanded] = useState(false);
  const schemaPanelId = useId();

  // Auto-clear copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timeoutId = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [copySuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setResult(null);
    setIsLoading(true);
    setIsSchemaPanelExpanded(false);

    try {
      const schemaResult = generateUiSchema(prompt);
      
      // Check for errors
      if (schemaResult.diagnostic.level === "error") {
        setError(schemaResult.diagnostic.errors.join(" "));
        setResult(schemaResult);
      } else {
        setResult(schemaResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate schema");
    } finally {
      setIsLoading(false);
    }
  };

  const getDiagnosticColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">DevSight AI</h1>
          </div>
          <p className="text-xl text-gray-600">
            Describe the developer tool or dashboard you want to generate
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="prompt" 
                className="block text-sm font-medium text-gray-700"
              >
                What would you like to build?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Show API latency trends', 'Create a logs viewer', 'Display error metrics', 'API tester dashboard'..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Describe your tool in natural language. Be specific about what you want to see.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Schema...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate UI Schema
                </>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && !result && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Diagnostic Information */}
              <div className={`p-4 border rounded-lg ${getDiagnosticColor(result.diagnostic.level)}`}>
                <div className="flex items-start gap-3">
                  {result.diagnostic.level === "error" ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : result.diagnostic.level === "warning" ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium">
                      {result.diagnostic.level === "error" 
                        ? "Schema Generation Failed"
                        : result.diagnostic.level === "warning"
                        ? "Schema Generated with Warnings"
                        : "Schema Generated Successfully"}
                    </h3>
                    
                    {result.diagnostic.errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Errors:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {result.diagnostic.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.diagnostic.warnings.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Warnings:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {result.diagnostic.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.diagnostic.questions.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Suggestions:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {result.diagnostic.questions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.diagnostic.ambiguous && (
                      <p className="text-sm">
                        The prompt was ambiguous. Please be more specific about what type of UI you want.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Generated Schema */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isSchemaPanelExpanded}
                  aria-controls={schemaPanelId}
                  onClick={() => setIsSchemaPanelExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-gray-900">
                      Schema Debug Panel
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pretty-printed, read-only JSON
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{isSchemaPanelExpanded ? "Hide" : "Show"}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isSchemaPanelExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </div>
                </button>
                <div
                  id={schemaPanelId}
                  aria-hidden={!isSchemaPanelExpanded}
                  className={`transition-[max-height,opacity,padding] duration-300 overflow-hidden ${
                    isSchemaPanelExpanded
                      ? "max-h-[70vh] opacity-100 p-4 pt-0"
                      : "max-h-0 opacity-0 p-0"
                  }`}
                >
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono">
                      {JSON.stringify(result.schema, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Normalized Prompt */}
              {result.diagnostic.normalizedPrompt && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Normalized Prompt</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {result.diagnostic.normalizedPrompt}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPrompt("");
                      setResult(null);
                      setError(null);
                      setCopySuccess(false);
                      setCopyError(null);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear & Start Over
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setCopyError(null);
                        await navigator.clipboard.writeText(JSON.stringify(result.schema, null, 2));
                        setCopySuccess(true);
                      } catch (err) {
                        console.error("Failed to copy:", err);
                        setCopyError("Failed to copy to clipboard. Please try selecting and copying manually.");
                      }
                    }}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {copySuccess ? "Copied! ✓" : "Copy Schema JSON"}
                  </button>
                </div>
                
                {/* Copy Error Display */}
                {copyError && (
                  <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">{copyError}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Examples Section */}
        {!result && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Example Prompts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Show API latency trends over time",
                "Create a logs viewer with error filtering",
                "Display CPU and memory metrics",
                "Build an API endpoint tester",
                "Show database query performance",
                "Create documentation links"
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            DevSight AI uses natural language processing to generate UI schemas for developer tools.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/" className="text-blue-600 hover:text-blue-700">← Back to Home</a>
            <a href="/chat" className="text-blue-600 hover:text-blue-700">Go to Chat →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
