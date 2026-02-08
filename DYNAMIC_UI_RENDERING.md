# Dynamic UI Rendering Implementation Guide

This document explains the dynamic UI rendering system implemented for DevSight AI using Tambo.

## Overview

The dynamic UI rendering system provides:
- **Error Boundaries**: Catch and handle component rendering errors gracefully
- **Schema Validation**: Validate components before rendering
- **Timeout Protection**: Prevent hanging renders with configurable timeouts
- **Fallback UI**: User-friendly error states and loading indicators
- **Performance Optimization**: Prevent unnecessary re-renders with React.memo

## Architecture

### Component Hierarchy

```
MessageRenderedComponentArea (message.tsx)
    ↓
DynamicComponentRenderer (dynamic-component-renderer.tsx)
    ↓
ComponentErrorBoundary (component-error-boundary.tsx)
    ↓
Actual Component (Graph, DataCard, etc.)
```

### Rendering Flow

1. **Validation Phase**: Component is validated before rendering
2. **Timeout Setup**: Timer starts to detect slow renders
3. **Mounting Phase**: Component begins mounting with loading state
4. **Ready State**: After successful mount, component is marked as ready
5. **Error Handling**: Any errors are caught by the error boundary

## Components

### DynamicComponentRenderer

Main wrapper for all dynamically rendered components.

```tsx
<DynamicComponentRenderer
  component={message.renderedComponent}
  componentName="Graph"
  timeout={10000}
  validateComponent={true}
  onRenderSuccess={() => console.log("Success")}
  onRenderError={(error) => console.error(error)}
/>
```

**Props:**
- `component` - The React component to render
- `componentName` - Optional name for error messages
- `timeout` - Timeout in milliseconds (default: 10000)
- `validateComponent` - Whether to validate before rendering (default: true)
- `onRenderSuccess` - Callback on successful render
- `onRenderError` - Callback on render error

### ComponentErrorBoundary

Error boundary that catches rendering errors.

```tsx
<ComponentErrorBoundary
  componentName="Graph"
  onError={(error, errorInfo) => {
    console.error("Error:", error, errorInfo);
  }}
>
  <YourComponent />
</ComponentErrorBoundary>
```

### Fallback Components

#### InvalidSchemaFallback

Shows when schema validation fails.

```tsx
<InvalidSchemaFallback
  schemaError="Invalid component data"
  diagnostics={[
    "Missing required field: data",
    "Expected type: object"
  ]}
/>
```

#### ComponentLoadingFallback

Shows during component loading.

```tsx
<ComponentLoadingFallback
  message="Loading graph..."
/>
```

#### ComponentTimeoutFallback

Shows when render exceeds timeout.

```tsx
<ComponentTimeoutFallback
  onRetry={() => retryRender()}
/>
```

## Configuration

### Timeout Configuration

Default timeout is 10 seconds. To change:

```tsx
<DynamicComponentRenderer
  component={component}
  timeout={15000} // 15 seconds
/>
```

### Component Validation

Disable validation if needed:

```tsx
<DynamicComponentRenderer
  component={component}
  validateComponent={false}
/>
```

## Performance Optimization

### React.memo

Components are wrapped with `React.memo` to prevent unnecessary re-renders:

```tsx
export const Graph = React.memo(
  React.forwardRef<HTMLDivElement, GraphProps>(
    ({ data, title, ...props }, ref) => {
      // Component logic
    }
  )
);
```

This optimizes performance when:
- Props haven't changed
- Parent component re-renders
- Large datasets are being rendered

## Error States

### Component Validation Error

Triggered when:
- Component is not a valid React element
- Component is null or undefined
- Component type is invalid

**User sees:**
```
⚠️ Invalid component schema
The component could not be rendered due to schema validation errors.
```

### Rendering Error

Triggered when:
- Component throws an error during render
- Component lifecycle methods fail
- Dependencies are missing

**User sees:**
```
❌ Failed to render Component
The component encountered an error and could not be displayed.
▼ Technical details
  Error: [error message]
```

### Timeout Error

Triggered when:
- Component takes longer than `timeout` milliseconds to mount
- Async operations delay rendering

**User sees:**
```
⚠️ Component loading timeout
The component is taking longer than expected to load.
[Retry Button]
```

## Best Practices

### 1. Always Use DynamicComponentRenderer

Wrap all dynamically generated components:

```tsx
// ✅ Good
<DynamicComponentRenderer
  component={message.renderedComponent}
  componentName="Graph"
/>

// ❌ Bad - No error handling
<div>{message.renderedComponent}</div>
```

### 2. Provide Component Names

Help users understand what failed:

```tsx
<DynamicComponentRenderer
  component={component}
  componentName="PopulationGraph" // Clear name
/>
```

### 3. Handle Callbacks

Monitor component rendering:

```tsx
<DynamicComponentRenderer
  component={component}
  onRenderSuccess={() => {
    analytics.track("component_rendered");
  }}
  onRenderError={(error) => {
    logger.error("Render failed", error);
  }}
/>
```

### 4. Set Appropriate Timeouts

Consider component complexity:

```tsx
// Simple component
<DynamicComponentRenderer timeout={5000} />

// Complex data visualization
<DynamicComponentRenderer timeout={15000} />
```

### 5. Optimize with React.memo

For custom components:

```tsx
export const MyComponent = React.memo(
  React.forwardRef<HTMLDivElement, MyComponentProps>(
    (props, ref) => {
      return <div ref={ref}>{/* ... */}</div>;
    }
  )
);
```

## Debugging

### Enable Debug Logging

```tsx
<DynamicComponentRenderer
  component={component}
  onRenderSuccess={() => {
    console.debug("Component rendered successfully");
  }}
  onRenderError={(error) => {
    console.error("Component render failed:", error);
  }}
/>
```

### Check Component State

Components log to console when they change state:
- "Loading component..."
- "Successfully rendered component: [name]"
- "Failed to render component: [name]"

### Common Issues

#### Issue: Component not rendering

**Cause**: Invalid component data
**Solution**: Check that `message.renderedComponent` is a valid React element

#### Issue: Infinite loading state

**Cause**: Timeout not triggered or component stuck
**Solution**: Check component logic for infinite loops or async issues

#### Issue: Performance degradation

**Cause**: Unnecessary re-renders
**Solution**: Ensure components are wrapped with React.memo

## Testing

### Test Error Boundary

```tsx
// Simulate error
const ErrorComponent = () => {
  throw new Error("Test error");
};

<DynamicComponentRenderer
  component={<ErrorComponent />}
  onRenderError={(error) => {
    expect(error.message).toBe("Test error");
  }}
/>
```

### Test Timeout

```tsx
// Simulate slow component
const SlowComponent = () => {
  React.useEffect(() => {
    // Simulate slow mount
    const timer = setTimeout(() => {}, 20000);
    return () => clearTimeout(timer);
  }, []);
  return <div>Slow</div>;
};

<DynamicComponentRenderer
  component={<SlowComponent />}
  timeout={5000}
  // Should show timeout fallback
/>
```

### Test Validation

```tsx
// Invalid component
<DynamicComponentRenderer
  component={null}
  validateComponent={true}
  // Should show InvalidSchemaFallback
/>
```

## CSS Variables

New warning colors added to globals.css:

```css
/* Light mode */
--warning: oklch(0.7 0.18 75);
--warning-foreground: oklch(0.2 0.02 75);

/* Dark mode */
--warning: oklch(0.75 0.18 75);
--warning-foreground: oklch(0.95 0.02 75);
```

Use in components:

```tsx
<div className="text-warning bg-warning/10">
  Warning message
</div>
```

## Migration Guide

### Existing Components

Update existing message rendering:

**Before:**
```tsx
<div className="w-full">
  {message.renderedComponent}
</div>
```

**After:**
```tsx
<DynamicComponentRenderer
  component={message.renderedComponent}
  componentName="Component"
  className="w-full"
/>
```

### Custom Error Handling

Replace custom error boundaries:

**Before:**
```tsx
<ErrorBoundary fallback={<div>Error</div>}>
  {component}
</ErrorBoundary>
```

**After:**
```tsx
<DynamicComponentRenderer
  component={component}
  onRenderError={(error) => {
    // Custom error handling
  }}
/>
```

## References

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React.memo](https://react.dev/reference/react/memo)
- [Tambo Documentation](https://docs.tambo.co)
