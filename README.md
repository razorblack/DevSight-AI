# DevSight AI

> "Ask your system. The UI answers."

**A generative developer copilot dashboard that creates on-demand tooling UIs from natural language prompts.**

[![Built with Tambo](https://img.shields.io/badge/Built%20with-Tambo-7FFFC3)](https://tambo.co)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## 🎯 Project Overview

DevSight AI is an intelligent developer dashboard that eliminates the gap between asking questions and getting answers. Instead of navigating through static dashboards, predefined views, and multiple tools, developers can simply ask questions in natural language—and watch as the perfect UI materializes in real time.

**The Result:** A living, adaptive interface that reshapes itself around the developer's problem, not the other way around.

## 💡 Motivation

Modern development teams are drowning in tools, dashboards, and data. When something goes wrong:

- Engineers waste time **switching between multiple monitoring tools**
- They have to **remember which dashboard shows what metric**
- They must **navigate complex UIs** to find simple answers
- **Static dashboards can't adapt** to unique, ad-hoc questions

**DevSight AI solves this by turning questions into interfaces.**

Instead of:
```
Open Grafana → Navigate to API metrics → Filter by service → Check latency graphs
Open Datadog → Search logs → Filter errors → Cross-reference with traces
Open Sentry → Check error rate → Look for patterns
```

You simply ask:
```
"Why is my API slow?"
```

And DevSight AI instantly generates the exact UI you need—charts showing latency trends, tables of slow endpoints, logs with relevant errors—all in one cohesive, context-aware interface.

## 🧩 What Problem Does DevSight AI Solve?

### The Problem: Static Dashboards Don't Scale with Developer Needs

1. **Tool Fragmentation**: Metrics in Grafana, logs in Datadog, errors in Sentry, traces in Jaeger
2. **Context Switching**: Every question requires navigating a different tool
3. **Inflexible UIs**: Dashboards are built for general use cases, not specific problems
4. **Slow Answers**: Finding an answer takes 5-10 clicks when it should take one question

### The Solution: Generative, Intent-Driven UIs

DevSight AI uses **AI to understand developer intent** and **Tambo to generate the perfect UI** on demand:

- **Ask "Show recent errors"** → AI generates an error log table with filtering
- **Ask "API latency trends"** → AI generates a line chart with the relevant data
- **Ask "Which endpoints are slowest?"** → AI generates a ranked table with performance metrics
- **Ask "Show database query performance"** → AI generates visualizations of slow queries

The UI is **generated, not predefined**—meaning it can adapt to any question, any data source, any context.

## 🚀 How Tambo Powers DevSight AI

[Tambo](https://tambo.co) is the generative UI framework that makes DevSight AI possible. Here's how it works:

### 1. **Component Registration System**

Developers register UI components (charts, tables, cards) with Tambo. Each component has:
- A **name** and **description** for the AI to understand its purpose
- A **Zod schema** defining the props the component accepts
- A **React component** that renders the UI

```tsx
// Example: Register a Graph component
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "Renders charts (bar, line, pie) with customizable data",
    component: Graph,
    propsSchema: graphSchema, // Zod schema for type-safe props
  },
];
```

### 2. **Tool System for Data Fetching**

Tools are functions that fetch data from external sources (APIs, databases, logs). The AI can invoke these tools to get real-time data:

```tsx
// Example: Tool to fetch global population trends
export const tools: TamboTool[] = [
  {
    name: "globalPopulation",
    description: "Get global population trends with year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(z.object({
      year: z.number(),
      population: z.number(),
      growthRate: z.number(),
    })),
  },
];
```

### 3. **AI-Powered Intent Understanding**

When a developer asks a question:
1. **Tambo's AI** understands the intent (e.g., "show API latency")
2. The AI **invokes relevant tools** to fetch data (e.g., `getApiLatency()`)
3. The AI **selects the right components** to visualize the data (e.g., `Graph`)
4. The AI **generates the props** needed to render the component
5. **Tambo renders the UI** in real-time

### 4. **Streaming Architecture**

DevSight AI uses Tambo's **streaming capabilities** to progressively render UIs as the AI generates them:

```tsx
const { isStreaming } = useTamboStreaming();
```

This creates a **smooth, real-time experience** where developers see the UI being built as they ask questions.

## 🏗️ Architecture

DevSight AI follows a **three-layer architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│  (Chat Interface, Message Threads, Interactive Components)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tambo AI Orchestration Layer              │
│  • Intent Understanding (Natural Language → Actions)        │
│  • Component Selection (Choose the right UI for the task)   │
│  • Tool Invocation (Fetch data from external sources)       │
│  • Props Generation (Create type-safe component props)      │
│  • Streaming Renderer (Progressive UI updates)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data & Component Layer                    │
│  • Registered Components (Graph, DataCard, Tables, etc.)    │
│  • Registered Tools (Data fetchers, API clients)            │
│  • External Data Sources (Metrics, Logs, Traces, APIs)      │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Patterns

#### **1. Provider Pattern** (`TamboProvider`)
Wraps the entire app and provides:
- Tambo API key for authentication
- Registered components available to the AI
- Registered tools for data fetching

#### **2. Component Registration** (`src/lib/tambo.ts`)
Central configuration where:
- All generative components are registered
- All data-fetching tools are registered
- Zod schemas ensure type safety

#### **3. Streaming Hooks** (`useTamboStreaming`, `useTamboThread`)
Real-time state management:
- Stream AI responses as they're generated
- Manage conversation threads
- Handle user input and suggestions

#### **4. Type-Safe Props** (Zod Schemas)
Every component has a Zod schema:
- AI generates valid, type-safe props
- Runtime validation prevents errors
- TypeScript integration for compile-time checks

## 📁 Project Structure

```
DevSight-AI/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── chat/                # Main chat interface
│   │   ├── interactables/       # Interactive components demo
│   │   ├── layout.tsx           # Root layout with TamboProvider
│   │   └── page.tsx             # Landing page
│   │
│   ├── components/
│   │   ├── tambo/               # Tambo-specific components
│   │   │   ├── graph.tsx        # Recharts data visualization
│   │   │   ├── message*.tsx     # Chat UI components
│   │   │   └── thread*.tsx      # Thread management UI
│   │   ├── ui/                  # Reusable UI components
│   │   └── ApiKeyCheck.tsx      # API key validation
│   │
│   ├── lib/
│   │   ├── tambo.ts             # **CENTRAL CONFIG**: Component & tool registration
│   │   ├── thread-hooks.ts      # Custom thread management hooks
│   │   └── utils.ts             # Utility functions
│   │
│   └── services/
│       └── population-stats.ts  # Example data service (demo)
│
├── public/                      # Static assets
├── CLAUDE.md                    # AI assistant guidance
├── example.env.local            # Environment variables template
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15.5 | React framework with App Router |
| **UI Library** | React 19.1 | Component-based UI |
| **Language** | TypeScript 5.x | Type safety and developer experience |
| **AI Framework** | Tambo AI SDK | Generative UI orchestration |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with dark mode |
| **Schema Validation** | Zod | Runtime type validation |
| **Charts** | Recharts 3.5 | Data visualization |
| **Icons** | Lucide React | Icon library |
| **Animations** | Framer Motion | Smooth UI transitions |

## 📦 Installation & Local Setup

### Prerequisites

- **Node.js 18+** (recommended: 20+)
- **npm** or **yarn**
- **Tambo API Key** (get one free at [tambo.co/dashboard](https://tambo.co/dashboard))

### Step 1: Clone the Repository

```bash
git clone https://github.com/razorblack/DevSight-AI.git
cd DevSight-AI
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Rename `example.env.local` to `.env.local`:

```bash
mv example.env.local .env.local
```

Add your Tambo API key to `.env.local`:

```env
TAMBO_API_KEY=your-api-key-here
```

Or use the Tambo CLI to initialize:

```bash
npx tambo init
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Try It Out!

1. **Visit `/chat`** to start a conversation
2. **Ask questions** like:
   - "Show me global population trends"
   - "Display top countries by population"
   - "Create a graph of population growth rates"
3. **Watch Tambo generate the UI** in real-time!

## 🎨 Customizing DevSight AI

### Adding New Components

1. **Create a new component** in `src/components/tambo/`:

```tsx
// src/components/tambo/my-component.tsx
import { z } from "zod";

export const myComponentSchema = z.object({
  title: z.string(),
  data: z.array(z.string()),
});

type MyComponentProps = z.infer<typeof myComponentSchema>;

export const MyComponent = ({ title, data }: MyComponentProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {data.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
};
```

2. **Register the component** in `src/lib/tambo.ts`:

```tsx
import { MyComponent, myComponentSchema } from "@/components/tambo/my-component";

export const components: TamboComponent[] = [
  // ... existing components
  {
    name: "MyComponent",
    description: "Displays a list of items with a title",
    component: MyComponent,
    propsSchema: myComponentSchema,
  },
];
```

### Adding New Tools

1. **Create a tool function** in `src/services/`:

```tsx
// src/services/my-service.ts
export const fetchData = async (params: { query: string }) => {
  // Fetch data from your API/database
  const data = await fetch(`/api/data?q=${params.query}`);
  return data.json();
};
```

2. **Register the tool** in `src/lib/tambo.ts`:

```tsx
import { fetchData } from "@/services/my-service";

export const tools: TamboTool[] = [
  // ... existing tools
  {
    name: "fetchData",
    description: "Fetches data based on a search query",
    tool: fetchData,
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.array(z.any()),
  },
];
```

## 🚀 Deployment

DevSight AI is built with Next.js and can be deployed to any platform that supports Next.js.

> **📘 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frazorblack%2FDevSight-AI&env=TAMBO_API_KEY&envDescription=Get%20your%20Tambo%20API%20key%20from%20tambo.co/dashboard&project-name=devsight-ai&repository-name=devsight-ai)

#### Quick Start

1. **Push your code to GitHub**
2. **Import your repository** on [vercel.com](https://vercel.com)
3. **Add environment variables** in Vercel dashboard:
   - `TAMBO_API_KEY` (required) - Get from [tambo.co/dashboard](https://tambo.co/dashboard)
   - `TAMBO_BASE_URL` (optional) - Defaults to `https://api.tambo.co`
   - `TAMBO_MAX_BODY_BYTES` (optional) - Defaults to `5242880` (5MB)
4. **Deploy!**

Vercel will automatically:
- Detect Next.js framework
- Run `npm install` to install dependencies
- Run `npm run build` to create production build
- Deploy to a global CDN

#### Environment Variables

All environment variables should be added in the Vercel dashboard under **Project Settings → Environment Variables**:

- Set for **Production**, **Preview**, and **Development** environments
- Server-side variables (e.g., `TAMBO_API_KEY`) remain secure and never exposed to the browser
- Client-side variables must use `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_TAMBO_URL`)

### Deploy to Other Platforms

DevSight AI can also be deployed to:
- **Netlify**: Use the Next.js runtime
- **AWS Amplify**: Connect your GitHub repo
- **Railway**: One-click deploy with environment variables
- **Render**: Connect repo and set build command
- **Self-hosted**: Run `npm run build && npm run start`

> **Note**: Regardless of platform, you must set the `TAMBO_API_KEY` environment variable.

### Production Build

Test the production build locally:

```bash
# Build the production bundle
npm run build

# Start the production server
npm run start
```

The production build:
- ✅ Optimizes bundle size
- ✅ Pre-renders static pages
- ✅ Enables server-side rendering
- ✅ Configures proper caching headers

### Deployment Verification

After deploying, verify:

- [ ] Build completes without errors
- [ ] Environment variables are set correctly
- [ ] Home page loads at `/`
- [ ] Chat interface works at `/chat`
- [ ] API route responds at `/api/tambo`
- [ ] No console errors in browser
- [ ] AI responses generate properly

For troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

The production build is optimized and ready for deployment.

## 🌐 Live Demo

> 🚧 **Coming Soon**: Live demo link will be added after deployment

Check back soon for a live, interactive demo of DevSight AI!

## 📚 Additional Resources

- **Tambo Documentation**: [docs.tambo.co](https://docs.tambo.co)
- **Tambo Dashboard**: [tambo.co/dashboard](https://tambo.co/dashboard)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tambo CLI**: Run `npx tambo help` for available commands

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 MVP Completion Checklist

DevSight AI MVP is considered complete when:

- ✅ A user can describe a developer tool in text
- ✅ AI generates a structured UI schema
- ✅ Tambo dynamically renders the UI
- ⏳ App is deployed and accessible via a public URL
- ✅ README clearly explains the project

---

**Built with ❤️ using [Tambo AI](https://tambo.co)**
