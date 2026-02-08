"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for ComponentErrorBoundary
 */
interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for ComponentErrorBoundary
 */
interface ComponentErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Global error boundary for Tambo rendered components
 * Catches rendering errors and displays a user-friendly fallback UI
 */
export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error("Component rendering error:", error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const { componentName } = this.props;
      const errorMessage = this.state.error?.message || "Unknown error";

      return (
        <div
          className={cn(
            "w-full rounded-lg border-2 border-destructive/20 bg-destructive/5 p-4",
            this.props.className,
          )}
          data-error-boundary="true"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-destructive mb-1">
                {componentName
                  ? `Failed to render ${componentName} component`
                  : "Component rendering error"}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                The component encountered an error and could not be displayed.
              </p>
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground transition-colors">
                  Technical details
                </summary>
                <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                  {errorMessage}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Props for InvalidSchemaFallback
 */
interface InvalidSchemaFallbackProps {
  className?: string;
  schemaError?: string;
  diagnostics?: string[];
}

/**
 * Fallback UI component for invalid or missing schemas
 * Displays when schema validation fails or required data is missing
 */
export const InvalidSchemaFallback = React.forwardRef<
  HTMLDivElement,
  InvalidSchemaFallbackProps
>(({ className, schemaError, diagnostics }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "w-full rounded-lg border-2 border-warning/20 bg-warning/5 p-4",
        className,
      )}
      data-schema-error="true"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-warning mb-1">
            Invalid component schema
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            The component could not be rendered due to schema validation
            errors.
          </p>
          {schemaError && (
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Error:</strong> {schemaError}
            </div>
          )}
          {diagnostics && diagnostics.length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground transition-colors">
                Diagnostic information
              </summary>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {diagnostics.map((diagnostic, index) => (
                  <li key={index}>{diagnostic}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
});

InvalidSchemaFallback.displayName = "InvalidSchemaFallback";

/**
 * Props for ComponentLoadingFallback
 */
interface ComponentLoadingFallbackProps {
  className?: string;
  message?: string;
}

/**
 * Loading state component for components being rendered
 * Shows while component is mounting or data is being processed
 */
export const ComponentLoadingFallback = React.forwardRef<
  HTMLDivElement,
  ComponentLoadingFallbackProps
>(({ className, message = "Loading component..." }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-muted/20 p-4",
        className,
      )}
      data-loading="true"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1 h-4">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.2s]"></span>
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.1s]"></span>
        </div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
});

ComponentLoadingFallback.displayName = "ComponentLoadingFallback";

/**
 * Props for ComponentTimeoutFallback
 */
interface ComponentTimeoutFallbackProps {
  className?: string;
  onRetry?: () => void;
}

/**
 * Timeout fallback component for components that take too long to render
 * Provides option to retry rendering
 */
export const ComponentTimeoutFallback = React.forwardRef<
  HTMLDivElement,
  ComponentTimeoutFallbackProps
>(({ className, onRetry }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-muted/10 p-4",
        className,
      )}
      data-timeout="true"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-6 w-6 text-warning" />
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Component loading timeout
          </h3>
          <p className="text-sm text-muted-foreground">
            The component is taking longer than expected to load.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
});

ComponentTimeoutFallback.displayName = "ComponentTimeoutFallback";
