import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";

import { EmptyState, InsightCard, LineChart, StatusCard, Table } from "../components";

export const tamboComponents: TamboComponent[] = [
  {
    name: "LineChart",
    description:
      "Displays a simple time series as a line chart. Use for latency, error rate, or other trends.",
    component: LineChart,
    propsSchema: z.object({
      title: z.string(),
      dataKey: z.string().optional(),
      data: z
        .array(z.object({ time: z.string(), value: z.number() }))
        .optional(),
    }),
  },
  {
    name: "Table",
    description:
      "Displays a list of objects in a table. Use for errors, endpoints, or deployments.",
    component: Table,
    propsSchema: z.object({
      title: z.string(),
      columns: z.array(z.string()),
      dataKey: z.string().optional(),
      data: z.array(z.record(z.string(), z.unknown())).optional(),
    }),
  },
  {
    name: "InsightCard",
    description:
      "A short, developer-focused insight or hypothesis in plain language.",
    component: InsightCard,
    propsSchema: z.object({
      title: z.string().optional(),
      content: z.string(),
    }),
  },
  {
    name: "StatusCard",
    description:
      "A quick health/status indicator for a service, deployment, or subsystem.",
    component: StatusCard,
    propsSchema: z.object({
      title: z.string(),
      status: z.enum(["healthy", "degraded", "down"]),
      description: z.string().optional(),
    }),
  },
  {
    name: "EmptyState",
    description:
      "A placeholder state when nothing is selected or the prompt is unsupported.",
    component: EmptyState,
    propsSchema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  },
];
