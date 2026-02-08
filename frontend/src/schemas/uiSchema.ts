export type UiLayout = "grid" | "stack" | "split";

export type UiComponentType =
  | "LineChart"
  | "Table"
  | "InsightCard"
  | "StatusCard"
  | "EmptyState";

export interface UiComponentDescriptor {
  type: UiComponentType;
  props: Record<string, unknown>;
}

export interface UiSchema {
  title: string;
  layout: UiLayout;
  components: UiComponentDescriptor[];
}

export interface GenerateUiRequest {
  prompt: string;
}

export interface GenerateUiResponse {
  schema: UiSchema;
  data: Record<string, unknown>;
}
