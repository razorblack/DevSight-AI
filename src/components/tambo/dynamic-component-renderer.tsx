"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ComponentErrorBoundary,
  InvalidSchemaFallback,
  ComponentLoadingFallback,
  ComponentTimeoutFallback,
} from "./component-error-boundary";

/**
 * Props for DynamicComponentRenderer
 */
interface DynamicComponentRendererProps {
  /** The component to render (React element) */
  component: React.ReactNode;
  /** Optional component name for error messages */
  componentName?: string;
  /** Optional className for styling */
  className?: string;
  /** Timeout in milliseconds before showing timeout fallback (default: 10000ms) */
  timeout?: number;
  /** Whether to validate the component before rendering */
  validateComponent?: boolean;
  /** Optional callback when component renders successfully */
  onRenderSuccess?: () => void;
  /** Optional callback when component fails to render */
  onRenderError?: (error: Error) => void;
}

/**
 * Validates that the component is a valid React element
 */
function isValidComponent(component: React.ReactNode): boolean {
  if (!component) return false;
  if (React.isValidElement(component)) return true;
  // Check if it's a functional component or class component
  if (typeof component === "function") return true;
  return false;
}

/**
 * Dynamic Component Renderer with error handling, timeouts, and validation
 * 
 * This component wraps dynamically rendered components with:
 * - Error boundaries for catching rendering errors
 * - Timeout detection for slow-loading components
 * - Schema validation for component props
 * - Loading states during component mount
 * 
 * @component
 * @example
 * ```tsx
 * <DynamicComponentRenderer
 *   component={message.renderedComponent}
 *   componentName="Graph"
 *   timeout={5000}
 *   onRenderSuccess={() => console.log("Rendered!")}
 * />
 * ```
 */
export const DynamicComponentRenderer = React.forwardRef<
  HTMLDivElement,
  DynamicComponentRendererProps
>(
  (
    {
      component,
      componentName,
      className,
      timeout = 10000,
      validateComponent: shouldValidate = true,
      onRenderSuccess,
      onRenderError,
    },
    ref,
  ) => {
    const [renderState, setRenderState] = React.useState<
      "loading" | "ready" | "timeout" | "invalid"
    >("loading");
    const [retryCount, setRetryCount] = React.useState(0);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const mountedRef = React.useRef(false);

    // Validate component on mount and when component changes
    React.useEffect(() => {
      if (shouldValidate && !isValidComponent(component)) {
        setRenderState("invalid");
        return;
      }

      // Start timeout timer
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && renderState === "loading") {
          setRenderState("timeout");
        }
      }, timeout);

      // Mark as ready after a small delay to allow React to mount
      const readyTimer = setTimeout(() => {
        if (mountedRef.current) {
          setRenderState("ready");
          if (onRenderSuccess) {
            onRenderSuccess();
          }
        }
      }, 100);

      mountedRef.current = true;

      // Cleanup
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        clearTimeout(readyTimer);
        mountedRef.current = false;
      };
    }, [component, shouldValidate, timeout, renderState, onRenderSuccess]);

    // Handle retry
    const handleRetry = React.useCallback(() => {
      setRetryCount((prev) => prev + 1);
      setRenderState("loading");
    }, []);

    // Handle error callback
    const handleError = React.useCallback(
      (error: Error, errorInfo: React.ErrorInfo) => {
        if (onRenderError) {
          onRenderError(error);
        }
        console.error("Component render error:", {
          componentName,
          error,
          errorInfo,
        });
      },
      [componentName, onRenderError],
    );

    // Show loading state
    if (renderState === "loading") {
      return (
        <ComponentLoadingFallback
          ref={ref}
          className={className}
          message={
            retryCount > 0
              ? `Retrying... (Attempt ${retryCount + 1})`
              : "Loading component..."
          }
        />
      );
    }

    // Show invalid schema fallback
    if (renderState === "invalid") {
      return (
        <InvalidSchemaFallback
          ref={ref}
          className={className}
          schemaError="Invalid or missing component data"
          diagnostics={[
            "The component could not be validated",
            "Ensure the component is a valid React element",
          ]}
        />
      );
    }

    // Show timeout fallback
    if (renderState === "timeout") {
      return (
        <ComponentTimeoutFallback
          ref={ref}
          className={className}
          onRetry={handleRetry}
        />
      );
    }

    // Render component with error boundary
    return (
      <ComponentErrorBoundary
        className={className}
        componentName={componentName}
        onError={handleError}
      >
        <div ref={ref} className={cn("w-full", className)} data-component-renderer="true">
          {component}
        </div>
      </ComponentErrorBoundary>
    );
  },
);

DynamicComponentRenderer.displayName = "DynamicComponentRenderer";
