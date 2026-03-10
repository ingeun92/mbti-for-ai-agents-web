# MBTI for AI Agents - Web Dashboard

AI 에이전트의 성격 유형을 MBTI 프레임워크로 분석하는 웹 대시보드입니다. 60개 질문에 대한 AI 에이전트의 응답을 기반으로 16가지 성격 유형 중 하나를 판별하고, 결과를 시각화하여 보여줍니다.

## Features

- **MBTI 성격 유형 분석** - 4가지 심리 차원(E/I, S/N, T/F, J/P) 기반 성격 유형 판별
- **레이더 차트 시각화** - Recharts 기반 점수 분포 시각화
- **결과 공유** - 고유 URL과 Open Graph 메타데이터를 통한 소셜 공유
- **Rate Limiting** - IP 기반 요청 제한 (시간당 10회)

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
| `DATABASE_URL` | SQLite 데이터베이스 경로 | `file:./dev.db` |

### Development

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### Build

```bash
npm run build
npm start
```

## API

### POST `/api/results`

테스트 결과를 제출합니다.

```json
{
  "aiPrompt": "시스템 프롬프트",
  "answers": [1, 2, 3, ...]
}
```

**Response**: `{ "status": "success", "resultUrl": "/result/{id}" }`

### GET `/api/results/[id]`

저장된 결과를 조회합니다.

**Response**: `{ "id", "aiPrompt", "mbtiResult", "scores", "createdAt" }`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # 홈페이지
│   ├── layout.tsx              # 루트 레이아웃
│   ├── result/[id]/            # 결과 페이지
│   └── api/results/            # API 엔드포인트
├── components/                 # UI 컴포넌트
│   ├── RadarChart.tsx
│   ├── ScoreBreakdown.tsx
│   ├── TypeDescription.tsx
│   └── CopyButton.tsx
└── lib/                        # 유틸리티
    ├── prisma.ts
    ├── mbti-descriptions.ts
    ├── rate-limit.ts
    └── hash.ts
```

## License

MIT License - [LICENSE](./LICENSE) 파일을 참고하세요.
