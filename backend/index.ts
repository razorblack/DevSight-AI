import cors from "cors";
import express from "express";

import { generateUi } from "./schemaGenerator";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/generate-ui", (req, res) => {
  const prompt = (req.body as { prompt?: unknown } | undefined)?.prompt;
  if (typeof prompt !== "string") {
    res.status(400).json({ error: "Invalid payload. Expected { prompt: string }" });
    return;
  }

  try {
    res.json(generateUi(prompt));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("generateUi failed", err);
    res.status(500).json({ error: "Failed to generate UI schema" });
  }
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`DevSight AI backend listening on http://localhost:${port}`);
});
