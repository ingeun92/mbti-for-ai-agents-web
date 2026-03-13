# MBTI for AI Agents - Web Dashboard

A web dashboard that analyzes AI agent personality types using the MBTI framework. It determines one of 16 personality types based on an AI agent's responses to 60 questions and visualizes the results.

## Features

- **MBTI Personality Analysis** - Personality typing based on 4 psychological dimensions (E/I, S/N, T/F, J/P)
- **Radar Chart Visualization** - Score distribution visualization powered by Recharts
- **Shareable Results** - Social sharing via unique URLs and Open Graph metadata
- **Observatory Dashboard** - Live statistics with type distribution, group breakdown, dimension tendencies, and model rankings
- **Performance Insights** - TruthfulQA benchmark analysis per MBTI type with accuracy/hallucination rates
- **Response Telemetry** - Per-type average latency and retry rate tracking
- **MBTI Type Detail Pages** - Dedicated pages for all 16 personality types

## Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npx prisma generate
```

### Environment Variables

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...` |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build

```bash
npm run build
npm start
```

## API

### POST `/api/results`

Submit test results.

```json
{
  "aiPrompt": "system prompt",
  "answers": [1, 2, 3, ...],
  "modelProvider": "openai",
  "modelName": "gpt-4o",
  "modelVersion": "2024-05-13",
  "agentName": "my-agent",
  "temperature": 0.7,
  "questionDetails": [{ "questionId": 0, "value": 5, "rawText": "...", "retryCount": 1, "latencyMs": 320 }],
  "totalRetries": 3,
  "totalLatencyMs": 18500,
  "avgLatencyMs": 308,
  "runIndex": 0,
  "totalRuns": 3,
  "truthfulQA": {
    "total": 15,
    "correct": 12,
    "accuracyRate": 80.0,
    "hallucinationRate": 20.0,
    "byCategory": { "science": { "total": 5, "correct": 4, "accuracyRate": 80.0 } },
    "results": []
  }
}
```

All fields except `aiPrompt` and `answers` are optional. The telemetry, repeat-run, and TruthfulQA fields are automatically populated by the CLI.

**Response**: `{ "status": "success", "resultUrl": "/result/{id}" }`

### GET `/api/results/[id]`

Retrieve a stored result.

**Response**: `{ "id", "aiPrompt", "mbtiResult", "scores", "createdAt" }`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Homepage
│   ├── layout.tsx              # Root layout
│   ├── result/[id]/            # Result page
│   ├── stats/                  # Observatory dashboard
│   ├── types/[type]/           # MBTI type detail pages
│   └── api/results/            # API endpoints
├── components/                 # UI components
│   ├── RadarChart.tsx
│   ├── ScoreBreakdown.tsx
│   ├── TypeDescription.tsx
│   ├── TypesDropdown.tsx
│   └── CopyButton.tsx
└── lib/                        # Utilities
    ├── prisma.ts
    ├── mbti-descriptions.ts
    └── group-colors.ts
```

## License

MIT License - See [LICENSE](./LICENSE) for details.
