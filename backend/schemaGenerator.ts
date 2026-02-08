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

export interface GenerateUiResult {
  schema: UiSchema;
  data: Record<string, unknown>;
}

const PROMPTS = {
  apiSlow: "why is my api slow?",
  recentErrors: "show recent errors",
  deployHealth: "deployment health summary",
} as const;

export function generateUi(prompt: string): GenerateUiResult {
  const normalized = prompt.trim().toLowerCase();

  if (normalized === PROMPTS.apiSlow) {
    return {
      schema: {
        title: "API Performance Analysis",
        layout: "grid",
        components: [
          {
            type: "LineChart",
            props: {
              title: "Latency over time (ms)",
              dataKey: "latency",
            },
          },
          {
            type: "Table",
            props: {
              title: "Slow endpoints",
              columns: ["endpoint", "avgLatency", "p95"],
              dataKey: "slowEndpoints",
            },
          },
          {
            type: "InsightCard",
            props: {
              content:
                "Latency spiked after the last deployment. P95 is elevated mostly on /search and /users endpoints.",
            },
          },
        ],
      },
      data: {
        latency: [
          { time: "10:00", value: 120 },
          { time: "10:05", value: 140 },
          { time: "10:10", value: 230 },
          { time: "10:15", value: 280 },
          { time: "10:20", value: 260 },
          { time: "10:25", value: 210 },
        ],
        slowEndpoints: [
          { endpoint: "GET /search", avgLatency: "310ms", p95: "980ms" },
          { endpoint: "GET /users", avgLatency: "260ms", p95: "820ms" },
          { endpoint: "POST /orders", avgLatency: "190ms", p95: "640ms" },
        ],
      },
    };
  }

  if (normalized === PROMPTS.recentErrors) {
    return {
      schema: {
        title: "Recent Errors",
        layout: "stack",
        components: [
          {
            type: "StatusCard",
            props: {
              title: "Error rate",
              status: "degraded",
              description: "Elevated 5xxs in the last 15 minutes (mock).",
            },
          },
          {
            type: "Table",
            props: {
              title: "Latest error events",
              columns: ["time", "service", "level", "message"],
              dataKey: "errors",
            },
          },
          {
            type: "InsightCard",
            props: {
              content:
                "Most errors originate from api-gateway with upstream timeouts to search-service. Consider checking recent changes and p95 latency.",
            },
          },
        ],
      },
      data: {
        errors: [
          {
            time: "10:22:41",
            service: "api-gateway",
            level: "ERROR",
            message: "Upstream timeout: search-service",
          },
          {
            time: "10:21:03",
            service: "search-service",
            level: "ERROR",
            message: "Redis read timeout",
          },
          {
            time: "10:19:55",
            service: "api-gateway",
            level: "WARN",
            message: "High latency calling /search",
          },
          {
            time: "10:18:12",
            service: "billing-service",
            level: "ERROR",
            message: "Stripe API: 502 Bad Gateway",
          },
        ],
      },
    };
  }

  if (normalized === PROMPTS.deployHealth) {
    return {
      schema: {
        title: "Deployment Health Summary",
        layout: "split",
        components: [
          {
            type: "LineChart",
            props: {
              title: "Deploy success rate (last 6 deploys)",
              dataKey: "deploySuccess",
            },
          },
          {
            type: "StatusCard",
            props: {
              title: "api-gateway",
              status: "healthy",
              description: "No active incidents (mock).",
            },
          },
          {
            type: "StatusCard",
            props: {
              title: "search-service",
              status: "degraded",
              description: "Increased p95 latency (mock).",
            },
          },
          {
            type: "Table",
            props: {
              title: "Recent deployments",
              columns: ["time", "service", "version", "status"],
              dataKey: "deployments",
            },
          },
          {
            type: "InsightCard",
            props: {
              content:
                "Search deploys show intermittent failures. If demoing, highlight how layout changes when the prompt changes.",
            },
          },
        ],
      },
      data: {
        deploySuccess: [
          { time: "d-5", value: 100 },
          { time: "d-4", value: 100 },
          { time: "d-3", value: 80 },
          { time: "d-2", value: 100 },
          { time: "d-1", value: 60 },
          { time: "now", value: 100 },
        ],
        deployments: [
          {
            time: "10:24",
            service: "search-service",
            version: "v1.9.2",
            status: "failed",
          },
          {
            time: "10:12",
            service: "api-gateway",
            version: "v2.3.0",
            status: "succeeded",
          },
          {
            time: "09:58",
            service: "billing-service",
            version: "v0.8.1",
            status: "succeeded",
          },
        ],
      },
    };
  }

  return {
    schema: {
      title: "Unsupported prompt",
      layout: "stack",
      components: [
        {
          type: "EmptyState",
          props: {
            title: "Unsupported prompt",
            description:
              "This MVP only supports: Why is my API slow? / Show recent errors / Deployment health summary",
          },
        },
      ],
    },
    data: {},
  };
}
