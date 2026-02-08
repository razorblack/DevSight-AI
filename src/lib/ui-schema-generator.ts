import type { RegisteredComponentName } from "./tambo";

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type JsonObject = { [key: string]: JsonValue };

export type JsonArray = JsonValue[];

export type UiSchemaVersion = 1;

export type UiSchemaComponent = {
  componentName: RegisteredComponentName;
  props: JsonObject;
};

export type UiSchemaV1 = {
  schemaVersion: UiSchemaVersion;
  components: UiSchemaComponent[];
};

export type SchemaDiagnosticLevel = "ok" | "warning" | "error";

export type SchemaDiagnostic = {
  level: SchemaDiagnosticLevel;
  warnings: string[];
  errors: string[];
  questions: string[];
  ambiguous: boolean;
  normalizedPrompt: string;
};

export type GenerateUiSchemaResult = {
  schema: UiSchemaV1;
  diagnostic: SchemaDiagnostic;
};

export type GenerateUiSchemaOptions = {
  maxPromptLength?: number;
};

export type UiSchemaGenerator = {
  generate: (developerPrompt: unknown, options?: GenerateUiSchemaOptions) => GenerateUiSchemaResult;
};

const DEFAULT_MAX_PROMPT_LENGTH = 2000;
const MAX_JSON_DEPTH = 30;

type Intent = "graph" | "dataCard";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  graph: [
    "chart",
    "graph",
    "plot",
    "bar",
    "line",
    "pie",
    "analytics",
    "trend",
    "latency",
    "errors",
  ],
  dataCard: [
    "card",
    "cards",
    "options",
    "list",
    "links",
    "resources",
    "actions",
    "choices",
  ],
};

const KEYWORD_REGEX_CACHE = new Map<string, RegExp>();

export function createUiSchemaGenerator(defaultOptions: GenerateUiSchemaOptions = {}): UiSchemaGenerator {
  return {
    generate: (developerPrompt, options) =>
      generateUiSchema(developerPrompt, {
        ...defaultOptions,
        ...options,
      }),
  };
}

/**
* Generate a JSON-serializable UI schema compatible with Tambo's rendered component shape.
*
* This is intentionally pure (no browser APIs) so it can be extracted to a backend later.
*/
export function generateUiSchema(
  developerPrompt: unknown,
  options: GenerateUiSchemaOptions = {},
): GenerateUiSchemaResult {
  const maxPromptLength = options.maxPromptLength ?? DEFAULT_MAX_PROMPT_LENGTH;

  const diagnostic: SchemaDiagnostic = {
    level: "ok",
    warnings: [],
    errors: [],
    questions: [],
    ambiguous: false,
    normalizedPrompt: "",
  };

  if (typeof developerPrompt !== "string") {
    diagnostic.level = "error";
    diagnostic.errors.push("Prompt must be a string.");
    return {
      schema: buildClarificationSchema(),
      diagnostic,
    };
  }

  const normalizedPrompt = normalizePrompt(developerPrompt);
  diagnostic.normalizedPrompt = normalizedPrompt;

  if (normalizedPrompt.length === 0) {
    diagnostic.level = "error";
    diagnostic.errors.push("Prompt is empty.");
    diagnostic.questions.push(
      "What UI should be generated? (e.g., \"latency chart\" or \"resource links\")",
    );
    return {
      schema: buildClarificationSchema(),
      diagnostic,
    };
  }

  if (normalizedPrompt.length > maxPromptLength) {
    diagnostic.level = "error";
    diagnostic.errors.push(`Prompt is too long (max ${maxPromptLength} characters).`);
    diagnostic.questions.push("Can you summarize the UI in 1-2 sentences?");
    return {
      schema: buildClarificationSchema(),
      diagnostic,
    };
  }

  const intentResult = detectIntent(normalizedPrompt);
  diagnostic.ambiguous = intentResult.ambiguous;

  if (intentResult.ambiguous) {
    diagnostic.level = "warning";
    diagnostic.warnings.push(
      `Prompt looks ambiguous (matched: ${intentResult.matchedIntents.map(prettyIntent).join(", ")}).`,
    );
    diagnostic.questions.push("Should the UI be a chart or a set of cards?");
    return {
      schema: buildClarificationSchema(intentResult.matchedIntents),
      diagnostic,
    };
  }

  const schema = buildSchemaForIntent(intentResult.intent, normalizedPrompt, diagnostic);
  if (!isJsonValue(schema)) {
    diagnostic.level = "error";
    diagnostic.errors.push("Generated schema is not JSON-serializable.");
    return {
      schema: buildClarificationSchema(),
      diagnostic,
    };
  }

  return { schema, diagnostic };
}

function normalizePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/[\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ");
}

function detectIntent(prompt: string): {
  intent: Intent;
  matchedIntents: Intent[];
  ambiguous: boolean;
} {
  const matchedIntents = (Object.keys(INTENT_KEYWORDS) as Intent[]).filter((intent) =>
    containsAny(prompt, INTENT_KEYWORDS[intent]),
  );

  if (matchedIntents.length === 0) {
    return {
      intent: "dataCard",
      matchedIntents: ["dataCard", "graph"],
      ambiguous: true,
    };
  }

  const intent = matchedIntents[0]!;
  return {
    intent,
    matchedIntents,
    ambiguous: matchedIntents.length > 1,
  };
}

function buildSchemaForIntent(intent: Intent, prompt: string, diagnostic: SchemaDiagnostic): UiSchemaV1 {
  switch (intent) {
    case "graph":
      return wrapSingleComponent("Graph", buildGraphProps(prompt, diagnostic));
    case "dataCard":
    default:
      return wrapSingleComponent("DataCard", buildDataCardProps(prompt));
  }
}

function wrapSingleComponent(componentName: RegisteredComponentName, props: JsonObject): UiSchemaV1 {
  return {
    schemaVersion: 1,
    components: [{ componentName, props }],
  };
}

function buildClarificationSchema(intents: Intent[] = ["dataCard", "graph"]): UiSchemaV1 {
  const options = intents.map((intent) => ({
    id: intent,
    label: prettyIntent(intent),
    value: intent,
    description:
      intent === "graph"
        ? "Generate a chart (requires labels + datasets)"
        : "Generate a set of selectable cards (good for links and actions)",
  }));

  return wrapSingleComponent("DataCard", {
    title: "Clarify UI request",
    options,
  });
}

function buildDataCardProps(prompt: string): JsonObject {
  if (containsAny(prompt, ["docs", "documentation", "resources", "links"])) {
    return {
      title: "Resources",
      options: [
        {
          id: "tambo-docs",
          label: "Tambo docs",
          value: "tambo-docs",
          description: "Read Tambo documentation and examples.",
          url: "https://docs.tambo.co",
        },
        {
          id: "next-docs",
          label: "Next.js docs",
          value: "next-docs",
          description: "Learn Next.js App Router patterns.",
          url: "https://nextjs.org/docs",
        },
      ],
    };
  }

  return {
    title: inferCardTitle(prompt),
    options: [
      {
        id: "graph",
        label: "Generate a chart",
        value: "graph",
        description: "Show a metric trend over time (sample data until wired to real sources).",
      },
      {
        id: "cards",
        label: "Generate cards",
        value: "dataCard",
        description: "Show choices or links as clickable cards.",
      },
    ],
  };
}

function inferCardTitle(prompt: string): string {
  if (containsAny(prompt, ["next steps", "todo", "tasks"])) return "Next steps";
  if (containsAny(prompt, ["incident", "outage"])) return "Incident helpers";
  return "Options";
}

function buildGraphProps(prompt: string, diagnostic: SchemaDiagnostic): JsonObject {
  if (diagnostic.level === "ok") diagnostic.level = "warning";
  diagnostic.warnings.push(
    "Graph uses sample data. Replace `data.labels` and `data.datasets` with real values before presenting as analytics.",
  );

  const { labels, metricLabel } = inferGraphAxes(prompt);
  const data = labels.map((_, idx) => 120 + idx * 30);

  return {
    title: `${metricLabel} over time (sample data)`,
    data: {
      type: containsAny(prompt, ["bar"]) ? "bar" : "line",
      labels,
      datasets: [
        {
          label: `${metricLabel} (sample)`,
          data,
          color: "hsl(220, 100%, 62%)",
        },
      ],
    },
    showLegend: true,
    variant: "solid",
  };
}

function inferGraphAxes(prompt: string): { labels: string[]; metricLabel: string } {
  if (containsAny(prompt, ["quarter", "quarterly", "q1", "q2", "q3", "q4"])) {
    return { labels: ["Q1", "Q2", "Q3", "Q4"], metricLabel: inferMetric(prompt) };
  }

  if (containsAny(prompt, ["month", "monthly"])) {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      metricLabel: inferMetric(prompt),
    };
  }

  if (containsAny(prompt, ["week", "weekly"])) {
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      metricLabel: inferMetric(prompt),
    };
  }

  return {
    labels: ["1", "2", "3", "4", "5"],
    metricLabel: inferMetric(prompt),
  };
}

function inferMetric(prompt: string): string {
  if (containsAny(prompt, ["latency", "slow"])) return "Latency (ms)";
  if (containsAny(prompt, ["error", "errors", "exceptions"])) return "Errors";
  if (containsAny(prompt, ["cpu"])) return "CPU (%)";
  if (containsAny(prompt, ["memory", "ram"])) return "Memory (MB)";
  if (containsAny(prompt, ["signup", "signups", "registration"])) return "Signups";
  if (containsAny(prompt, ["user", "users"])) return "Users";
  return "Metric";
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => containsKeyword(haystack, n));
}

function containsKeyword(haystack: string, needle: string): boolean {
  // This matcher is optimized for single-token keywords.
  // If callers pass phrases, require all tokens to appear.
  if (needle.includes(" ")) {
    return needle
      .split(/\s+/)
      .filter(Boolean)
      .every((part) => containsKeyword(haystack, part));
  }

  const cacheKey = needle.trim().toLowerCase();
  const cached = KEYWORD_REGEX_CACHE.get(cacheKey);
  if (cached) return cached.test(haystack);

  const escaped = escapeRegExp(needle.trim());
  const pattern = /[a-z0-9]/i.test(needle) ? `(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])` : escaped;
  const re = new RegExp(pattern, "i");
  KEYWORD_REGEX_CACHE.set(cacheKey, re);
  return re.test(haystack);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isJsonValue(value: unknown): value is JsonValue {
  return isJsonValueInner(value, 0);
}

function isJsonValueInner(value: unknown, depth: number): value is JsonValue {
  if (depth > MAX_JSON_DEPTH) return false;
  if (value === null) return true;

  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return true;
    case "object": {
      if (Array.isArray(value)) return value.every((v) => isJsonValueInner(v, depth + 1));

      for (const [, v] of Object.entries(value as Record<string, unknown>)) {
        if (!isJsonValueInner(v, depth + 1)) return false;
      }

      return true;
    }
    default:
      return false;
  }
}

function prettyIntent(intent: Intent): string {
  switch (intent) {
    case "graph":
      return "Graph";
    case "dataCard":
      return "Cards";
  }
}
