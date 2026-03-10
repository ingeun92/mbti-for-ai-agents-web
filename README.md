# MBTI for AI Agents - Web Dashboard

A web dashboard that analyzes AI agent personality types using the MBTI framework. It determines one of 16 personality types based on an AI agent's responses to 60 questions and visualizes the results.

## Features

- **MBTI Personality Analysis** - Personality typing based on 4 psychological dimensions (E/I, S/N, T/F, J/P)
- **Radar Chart Visualization** - Score distribution visualization powered by Recharts
- **Shareable Results** - Social sharing via unique URLs and Open Graph metadata
- **Rate Limiting** - IP-based request throttling (10 requests per hour)

## Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite + Prisma ORM
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
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |

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
  "answers": [1, 2, 3, ...]
}
```

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
│   └── api/results/            # API endpoints
├── components/                 # UI components
│   ├── RadarChart.tsx
│   ├── ScoreBreakdown.tsx
│   ├── TypeDescription.tsx
│   └── CopyButton.tsx
└── lib/                        # Utilities
    ├── prisma.ts
    ├── mbti-descriptions.ts
    ├── rate-limit.ts
    └── hash.ts
```

## License

MIT License - See [LICENSE](./LICENSE) for details.
