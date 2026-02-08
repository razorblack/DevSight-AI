"use client";

import { cn } from "@/lib/utils";
import { usePromptHistory } from "@/lib/prompt-history";
import { useTamboThreadInput } from "@tambo-ai/react";
import { Clock, X, Trash2 } from "lucide-react";
import * as React from "react";

/**
 * Props for the PromptHistory component
 */
export interface PromptHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  onPromptSelect?: (text: string) => void;
}

/**
 * A panel component that displays the history of prompts sent during the current session.
 * Allows users to click on a previous prompt to re-run it.
 */
export const PromptHistory = React.forwardRef<HTMLDivElement, PromptHistoryProps>(
  ({ className, onPromptSelect, ...props }, ref) => {
    const { history, clearHistory } = usePromptHistory();
    const { setValue } = useTamboThreadInput();
    const [isOpen, setIsOpen] = React.useState(false);
    const [showConfirmClear, setShowConfirmClear] = React.useState(false);

    const handlePromptClick = React.useCallback(
      (text: string) => {
        setValue(text);
        setIsOpen(false);
        onPromptSelect?.(text);
      },
      [setValue, onPromptSelect]
    );

    const handleClearHistory = React.useCallback(() => {
      clearHistory();
      setShowConfirmClear(false);
    }, [clearHistory]);

    const formatTimestamp = (timestamp: number) => {
      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return "just now";
    };

    return (
      <>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md",
            "bg-container hover:bg-backdrop",
            "border border-gray-300 dark:border-zinc-600",
            "transition-colors",
            history.length === 0 && "opacity-50 cursor-not-allowed"
          )}
          disabled={history.length === 0}
          title="View prompt history"
        >
          <Clock className="w-4 h-4" />
          <span>History ({history.length})</span>
        </button>

        {/* History Panel */}
        {isOpen && (
          <div
            ref={ref}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "w-full max-w-2xl max-h-[80vh]",
              "bg-background border border-gray-300 dark:border-zinc-600",
              "rounded-lg shadow-2xl",
              "flex flex-col",
              className
            )}
            {...props}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-zinc-600">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Prompt History
              </h2>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="p-2 rounded-md hover:bg-backdrop transition-colors"
                    title="Clear all history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-backdrop transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No prompts in history yet</p>
                  <p className="text-sm mt-2">
                    Your prompts will appear here during this session
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handlePromptClick(item.text)}
                      className={cn(
                        "w-full text-left p-3 rounded-md",
                        "bg-container hover:bg-backdrop",
                        "border border-gray-200 dark:border-zinc-700",
                        "transition-all hover:shadow-md",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 text-sm line-clamp-2">{item.text}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-300 dark:border-zinc-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                History is stored for this session only and will be cleared when you close
                the browser tab.
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmClear && (
          <div
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "w-full max-w-md",
              "bg-background border border-gray-300 dark:border-zinc-600",
              "rounded-lg shadow-2xl",
              "p-6"
            )}
          >
            <h3 className="text-lg font-semibold mb-2">Clear History?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to clear all prompt history? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-md bg-container hover:bg-backdrop border border-gray-300 dark:border-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {(isOpen || showConfirmClear) && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowConfirmClear(false);
            }}
          />
        )}
      </>
    );
  }
);
PromptHistory.displayName = "PromptHistory";
