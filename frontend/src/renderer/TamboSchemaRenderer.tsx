import { EmptyState } from "../components";
import type { UiComponentDescriptor, UiLayout, UiSchema } from "../schemas/uiSchema";
import { useDevSightRegistry } from "./useDevSightRegistry";

function layoutClassName(layout: UiLayout) {
  switch (layout) {
    case "grid":
      return "grid gap-4 md:grid-cols-2";
    case "stack":
      return "flex flex-col gap-4";
    case "split":
      return "grid gap-4 md:grid-cols-3";
  }
}

function resolveProps(
  descriptor: UiComponentDescriptor,
  data: Record<string, unknown>,
) {
  const rawProps = descriptor.props ?? {};
  const dataKey =
    typeof rawProps.dataKey === "string" ? (rawProps.dataKey as string) : null;

  if (!dataKey) return rawProps;

  return {
    ...rawProps,
    data: data[dataKey],
  };
}

export interface TamboSchemaRendererProps {
  schema: UiSchema;
  data: Record<string, unknown>;
}

export function TamboSchemaRenderer({ schema, data }: TamboSchemaRendererProps) {
  const { componentList } = useDevSightRegistry();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-100">{schema.title}</h2>

      <div className={`mt-4 ${layoutClassName(schema.layout)}`}>
        {schema.components.map((descriptor, idx) => {
          const registered = componentList[descriptor.type];
          const Component = registered?.component;

          const wrapperClassName =
            schema.layout === "split" && idx === 0
              ? "md:col-span-2"
              : "";

          if (!Component) {
            return (
              <div key={`${descriptor.type}-${idx}`} className={wrapperClassName}>
                <EmptyState
                  title="Unknown component"
                  description={`No component registered for type: ${descriptor.type}`}
                />
              </div>
            );
          }

          return (
            <div key={`${descriptor.type}-${idx}`} className={wrapperClassName}>
              <Component {...resolveProps(descriptor, data)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
