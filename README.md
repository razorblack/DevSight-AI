# DevSight AI

Ask your system. The UI answers.

DevSight AI is a hackathon MVP of a **generative developer copilot dashboard**.
You type a natural-language question about system health, the backend returns a **UI schema (JSON)** + **mock data**, and the frontend renders the UI dynamically.

## Problem

When you're debugging system health, you typically jump between dashboards, logs, and ad-hoc queries.
This MVP demonstrates the opposite approach: start with a question, and generate the dashboard view on demand.

## How generative UI works (in this MVP)

1. User enters a prompt in the UI.
2. Backend `POST /generate-ui` does simple string matching.
3. Backend returns:

   - `schema`: a JSON description of what components to render
   - `data`: mock data keyed by `dataKey`

4. Frontend uses **Tambo**'s component registry to map schema component `type` → a React component.
5. The renderer injects `data[dataKey]` into each component at render time.

This is intentionally lightweight for demo clarity: **no database, no auth, mock data only**.

## Supported prompts (only these)

- `Why is my API slow?`
- `Show recent errors`
- `Deployment health summary`

Each prompt returns a different `layout` so you can see the UI transform.

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and calls `http://localhost:3001/generate-ui`.

## Hackathon disclaimer

This project is an MVP for a hackathon demo, not a production system.
