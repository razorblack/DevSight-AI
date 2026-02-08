import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Maximum number of prompts to store in history
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Key for storing prompt history in sessionStorage
 */
const PROMPT_HISTORY_KEY = "tambo.promptHistory";

export interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

interface PromptHistoryContextValue {
  history: PromptHistoryItem[];
  addPrompt: (text: string) => void;
  clearHistory: () => void;
  removePrompt: (id: string) => void;
}

const PromptHistoryContext = createContext<PromptHistoryContextValue | null>(null);

/**
 * Provider component for prompt history management
 */
export function PromptHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Load history from sessionStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = sessionStorage.getItem(PROMPT_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PromptHistoryItem[];
          setHistory(parsed);
        }
      } catch (error) {
        console.error("Failed to load prompt history:", error);
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  /**
   * Add a new prompt to history
   */
  const addPrompt = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const newItem: PromptHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        text: text.trim(),
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // Add new item at the beginning and keep only the most recent MAX_HISTORY_SIZE items
        const newHistory = [newItem, ...prev].slice(0, MAX_HISTORY_SIZE);
        // Save to sessionStorage directly
        try {
          sessionStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
          console.error("Failed to save prompt history:", error);
        }
        return newHistory;
      });
    },
    []
  );

  /**
   * Clear all prompt history
   */
  const clearHistory = useCallback(() => {
    try {
      sessionStorage.removeItem(PROMPT_HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear prompt history:", error);
    }
  }, []);

  /**
   * Remove a specific prompt from history
   */
  const removePrompt = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter((item) => item.id !== id);
        // Save to sessionStorage directly
        try {
          sessionStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
          console.error("Failed to save prompt history:", error);
        }
        return newHistory;
      });
    },
    []
  );

  const value = React.useMemo(
    () => ({
      history,
      addPrompt,
      clearHistory,
      removePrompt,
    }),
    [history, addPrompt, clearHistory, removePrompt]
  );

  return (
    <PromptHistoryContext.Provider value={value}>
      {children}
    </PromptHistoryContext.Provider>
  );
}

/**
 * Hook to access the prompt history context.
 * Must be used within a PromptHistoryProvider.
 * 
 * @returns Object with history array and management functions
 */
export function usePromptHistory() {
  const context = useContext(PromptHistoryContext);
  if (!context) {
    throw new Error("usePromptHistory must be used within a PromptHistoryProvider");
  }
  return context;
}
