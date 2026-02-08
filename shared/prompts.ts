export const SUPPORTED_PROMPTS = [
  "Why is my API slow?",
  "Show recent errors",
  "Deployment health summary",
] as const;

export type SupportedPrompt = (typeof SUPPORTED_PROMPTS)[number];
