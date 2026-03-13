import { prisma } from '@/lib/prisma';
import { getGroup, GROUP_CONFIG, type MbtiGroup } from '@/lib/group-colors';
import { mbtiDescriptions } from '@/lib/mbti-descriptions';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Observatory - MBTI for AI Agents',
  description: 'Live statistics and trends from AI agent personality testing',
};

export const dynamic = 'force-dynamic';

const ALL_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function StatsPage() {
  const [
    totalTests,
    mbtiDistribution,
    modelDistribution,
    recentTests,
    allScores,
    uniqueAgents,
    uniqueModels,
    testsWithPerformance,
  ] = await Promise.all([
    prisma.test.count(),
    prisma.test.groupBy({
      by: ['mbtiResult'],
      _count: { mbtiResult: true },
      orderBy: { _count: { mbtiResult: 'desc' } },
    }),
    prisma.test.groupBy({
      by: ['modelProvider', 'modelName'],
      _count: { modelName: true },
      orderBy: { _count: { modelName: 'desc' } },
      where: { modelName: { not: null } },
      take: 8,
    }),
    prisma.test.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mbtiResult: true,
        modelName: true,
        modelProvider: true,
        agentName: true,
        createdAt: true,
      },
    }),
    prisma.test.findMany({
      select: { scores: true },
    }),
    prisma.test.groupBy({
      by: ['agentName'],
      where: { agentName: { not: null } },
    }),
    prisma.test.groupBy({
      by: ['modelName'],
      where: { modelName: { not: null } },
    }),
    prisma.test.findMany({
      select: {
        mbtiResult: true,
        truthfulQA: true,
        avgLatencyMs: true,
        totalRetries: true,
      },
    }),
  ]);

  // === Process Data ===
  const countMap: Record<string, number> = {};
  mbtiDistribution.forEach((d) => {
    countMap[d.mbtiResult] = d._count.mbtiResult;
  });

  const maxCount = Math.max(...Object.values(countMap), 1);

  const mbtiData = ALL_TYPES.map((type) => ({
    type,
    count: countMap[type] || 0,
    group: getGroup(type) as MbtiGroup,
    color: GROUP_CONFIG[getGroup(type)].color,
    percentage: totalTests > 0 ? ((countMap[type] || 0) / totalTests) * 100 : 0,
    barWidth: maxCount > 0 ? ((countMap[type] || 0) / maxCount) * 100 : 0,
    label: mbtiDescriptions[type]?.title || type,
  }));

  const mbtiSorted = [...mbtiData].sort((a, b) => b.count - a.count);

  // Group distribution
  const groupCounts: Record<MbtiGroup, number> = {
    analyst: 0,
    diplomat: 0,
    sentinel: 0,
    explorer: 0,
  };
  mbtiData.forEach((d) => {
    groupCounts[d.group] += d.count;
  });

  const groupData = (Object.entries(groupCounts) as [MbtiGroup, number][])
    .map(([group, count]) => ({
      group,
      name: GROUP_CONFIG[group].name,
      count,
      color: GROUP_CONFIG[group].color,
      percentage: totalTests > 0 ? (count / totalTests) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Dimension averages
  const dimTotals = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  allScores.forEach((test) => {
    const s = test.scores as Record<string, number> | null;
    if (s) {
      Object.keys(dimTotals).forEach((k) => {
        dimTotals[k as keyof typeof dimTotals] += s[k] || 0;
      });
    }
  });

  const n = allScores.length || 1;
  const dimensions = [
    {
      left: 'E',
      right: 'I',
      leftLabel: 'Extravert',
      rightLabel: 'Introvert',
      leftPct: dimTotals.E / n,
      rightPct: dimTotals.I / n,
      color: '#88619A',
    },
    {
      left: 'S',
      right: 'N',
      leftLabel: 'Sensing',
      rightLabel: 'Intuitive',
      leftPct: dimTotals.S / n,
      rightPct: dimTotals.N / n,
      color: '#33A474',
    },
    {
      left: 'T',
      right: 'F',
      leftLabel: 'Thinking',
      rightLabel: 'Feeling',
      leftPct: dimTotals.T / n,
      rightPct: dimTotals.F / n,
      color: '#4298B4',
    },
    {
      left: 'J',
      right: 'P',
      leftLabel: 'Judging',
      rightLabel: 'Perceiving',
      leftPct: dimTotals.J / n,
      rightPct: dimTotals.P / n,
      color: '#E4AE3A',
    },
  ];

  const topType = mbtiSorted[0];

  // === Performance Data Processing ===
  interface TruthfulQAJson {
    total: number;
    correct: number;
    accuracyRate: number;
    hallucinationRate: number;
    byCategory?: Record<string, { total: number; correct: number; accuracyRate: number }>;
  }

  const benchmarkAgg: Record<string, { count: number; totalAccuracy: number; totalHallucination: number }> = {};
  const telemetryAgg: Record<string, { count: number; totalLatency: number; totalRetries: number }> = {};
  const categoryAgg: Record<string, { total: number; correct: number }> = {};

  testsWithPerformance.forEach((test) => {
    const type = test.mbtiResult;

    if (test.truthfulQA && typeof test.truthfulQA === 'object') {
      const qa = test.truthfulQA as unknown as TruthfulQAJson;
      if (typeof qa.accuracyRate === 'number') {
        if (!benchmarkAgg[type]) benchmarkAgg[type] = { count: 0, totalAccuracy: 0, totalHallucination: 0 };
        benchmarkAgg[type].count++;
        benchmarkAgg[type].totalAccuracy += qa.accuracyRate;
        benchmarkAgg[type].totalHallucination += qa.hallucinationRate;

        if (qa.byCategory) {
          Object.entries(qa.byCategory).forEach(([cat, data]) => {
            if (!categoryAgg[cat]) categoryAgg[cat] = { total: 0, correct: 0 };
            categoryAgg[cat].total += data.total;
            categoryAgg[cat].correct += data.correct;
          });
        }
      }
    }

    if (test.avgLatencyMs != null) {
      if (!telemetryAgg[type]) telemetryAgg[type] = { count: 0, totalLatency: 0, totalRetries: 0 };
      telemetryAgg[type].count++;
      telemetryAgg[type].totalLatency += test.avgLatencyMs;
      telemetryAgg[type].totalRetries += test.totalRetries || 0;
    }
  });

  const benchmarkByType = Object.entries(benchmarkAgg)
    .map(([type, agg]) => ({
      type,
      group: getGroup(type) as MbtiGroup,
      color: GROUP_CONFIG[getGroup(type)].color,
      testCount: agg.count,
      avgAccuracy: agg.totalAccuracy / agg.count,
      avgHallucination: agg.totalHallucination / agg.count,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy);

  const telemetryByType = Object.entries(telemetryAgg)
    .map(([type, agg]) => ({
      type,
      group: getGroup(type) as MbtiGroup,
      color: GROUP_CONFIG[getGroup(type)].color,
      testCount: agg.count,
      avgLatency: agg.totalLatency / agg.count,
      avgRetries: agg.totalRetries / agg.count,
    }))
    .sort((a, b) => a.avgLatency - b.avgLatency);

  const categoryData = Object.entries(categoryAgg)
    .map(([category, data]) => ({
      category,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const totalBenchmarked = Object.values(benchmarkAgg).reduce((sum, a) => sum + a.count, 0);
  const overallAccuracy = totalBenchmarked > 0
    ? Object.values(benchmarkAgg).reduce((sum, a) => sum + a.totalAccuracy, 0) / totalBenchmarked
    : 0;
  const overallHallucination = totalBenchmarked > 0
    ? Object.values(benchmarkAgg).reduce((sum, a) => sum + a.totalHallucination, 0) / totalBenchmarked
    : 0;
  const hasBenchmarkData = totalBenchmarked > 0;
  const hasTelemetryData = Object.keys(telemetryAgg).length > 0;

  // Empty state check
  if (totalTests === 0) {
    return (
      <div>
        <section className="stats-hero relative overflow-hidden">
          <div className="stats-hero-grid" />
          <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 relative z-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-3">
              AI Agent Personality
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white tracking-tight mb-6">
              Observatory
            </h1>
            <p className="text-white/40 text-lg max-w-md mx-auto mb-10">
              No test data yet. Run your first AI agent personality test to see live statistics here.
            </p>
            <div className="max-w-sm mx-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 font-mono text-sm text-left">
              <p>
                <span className="text-white/30 select-none">$ </span>
                <span className="text-[#33A474]">npx</span>
                <span className="text-white/70"> ai-mbti-test</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="stats-hero relative overflow-hidden">
        <div className="stats-hero-grid" />
        <div className="max-w-6xl mx-auto px-6 py-14 sm:py-20 relative z-10">
          <div className="mb-10 animate-fade-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">
              AI Agent Personality
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Observatory
            </h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-up stagger-1">
            {[
              { label: 'Total Tests', value: totalTests, accent: '#88619A' },
              { label: 'Unique Agents', value: uniqueAgents.length, accent: '#33A474' },
              { label: 'AI Models', value: uniqueModels.length, accent: '#4298B4' },
              {
                label: 'Top Type',
                value: topType?.type || '\u2014',
                accent: topType?.color || '#E4AE3A',
                sub: topType?.label,
              },
            ].map((stat) => (
              <div key={stat.label} className="stats-counter group">
                <div
                  className="stats-counter-accent"
                  style={{ backgroundColor: stat.accent }}
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                  {stat.label}
                </p>
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-none">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
                {stat.sub && (
                  <p className="text-[11px] text-white/25 mt-1.5 font-medium">
                    {stat.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14 space-y-10">
        {/* ===== MBTI DISTRIBUTION ===== */}
        <section className="animate-fade-up stagger-2">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-body">
                Type Distribution
              </h2>
              <p className="text-sm text-body-muted mt-1">
                Personality breakdown across all tested AI agents
              </p>
            </div>
            <span className="text-xs font-mono text-body-muted hidden sm:block">
              {totalTests} total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0.5">
            {mbtiSorted.map((d, i) => (
              <Link
                key={d.type}
                href={`/types/${d.type}`}
                className="group flex items-center gap-3 py-2.5 px-3 sm:px-4 rounded-xl hover:bg-surface-100 transition-all duration-200"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-xs font-mono text-body-muted w-5 text-right hidden sm:block">
                  {i + 1}
                </span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="font-display font-bold text-sm text-body w-11">
                  {d.type}
                </span>
                <span className="text-xs text-body-muted w-24 truncate hidden md:block">
                  {d.label}
                </span>
                <div className="flex-1 h-6 bg-surface-100 rounded-md overflow-hidden relative">
                  <div
                    className="dist-bar h-full rounded-md group-hover:brightness-110 transition-all"
                    style={
                      {
                        '--bar-width': `${Math.max(d.barWidth, d.count > 0 ? 3 : 0)}%`,
                        backgroundColor: d.color,
                        opacity: 0.65,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <span className="text-xs font-mono text-body-light w-7 text-right tabular-nums">
                  {d.count}
                </span>
                <span className="text-[10px] font-mono text-body-muted w-14 text-right tabular-nums hidden sm:block">
                  {d.percentage.toFixed(1)}%
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== TWO COLUMN: Groups + Dimensions ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Breakdown */}
          <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up stagger-3">
            <h2 className="font-display text-lg font-semibold text-body mb-6">
              Group Breakdown
            </h2>
            <div className="space-y-5">
              {groupData.map((g) => (
                <div key={g.group}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: g.color }}
                      />
                      <span className="text-sm font-semibold text-body">
                        {g.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-mono font-semibold text-body">
                        {g.count}
                      </span>
                      <span className="text-[10px] font-mono text-body-muted">
                        ({g.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(g.percentage, g.count > 0 ? 2 : 0)}%`,
                        backgroundColor: g.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mini 4x4 grid */}
            <div className="mt-8 pt-6 border-t border-surface-200">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body-muted mb-3">
                Type Grid
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_TYPES.map((type) => {
                  const d = mbtiData.find((m) => m.type === type)!;
                  const intensity =
                    maxCount > 0 ? Math.max((d.count / maxCount) * 0.8 + 0.15, 0.15) : 0.15;
                  return (
                    <Link
                      key={type}
                      href={`/types/${type}`}
                      className="text-center py-2 rounded-lg transition-transform hover:scale-105"
                      style={{
                        backgroundColor: d.color,
                        opacity: intensity,
                      }}
                    >
                      <span className="text-[11px] font-bold text-white mix-blend-normal">
                        {type}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Dimension Tendencies */}
          <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up stagger-4">
            <h2 className="font-display text-lg font-semibold text-body mb-1">
              Dimension Tendencies
            </h2>
            <p className="text-xs text-body-muted mb-6">
              Average cognitive preferences across all tested agents
            </p>
            <div className="space-y-7">
              {dimensions.map((dim) => {
                const total = dim.leftPct + dim.rightPct;
                const leftRatio = total > 0 ? (dim.leftPct / total) * 100 : 50;
                const dominant = leftRatio >= 50 ? 'left' : 'right';
                return (
                  <div key={dim.left}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                          style={{
                            backgroundColor: dim.color,
                            opacity: dominant === 'left' ? 1 : 0.35,
                          }}
                        >
                          {dim.left}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            dominant === 'left' ? 'text-body' : 'text-body-muted'
                          }`}
                        >
                          {dim.leftLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            dominant === 'right' ? 'text-body' : 'text-body-muted'
                          }`}
                        >
                          {dim.rightLabel}
                        </span>
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                          style={{
                            backgroundColor: dim.color,
                            opacity: dominant === 'right' ? 1 : 0.35,
                          }}
                        >
                          {dim.right}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${leftRatio}%`,
                          backgroundColor: dim.color,
                          opacity: 0.55,
                        }}
                      />
                      <div
                        className="absolute right-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${100 - leftRatio}%`,
                          backgroundColor: dim.color,
                          opacity: 0.2,
                        }}
                      />
                      {/* Center mark */}
                      <div className="absolute left-1/2 top-0 w-px h-full bg-white/60 z-10" />
                      {/* Position indicator */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md z-20 transition-all duration-700"
                        style={{
                          left: `${leftRatio}%`,
                          transform: `translate(-50%, -50%)`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-body-muted tabular-nums">
                        {leftRatio.toFixed(1)}%
                      </span>
                      <span className="text-[10px] font-mono text-body-muted tabular-nums">
                        {(100 - leftRatio).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===== TWO COLUMN: Models + Activity ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Models */}
          <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up stagger-5">
            <h2 className="font-display text-lg font-semibold text-body mb-5">
              Top Models
            </h2>
            {modelDistribution.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-body-muted">No model data yet</p>
                <p className="text-xs text-body-muted mt-1">
                  Pass --model-name when running tests
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {modelDistribution.map((m, i) => {
                  const maxModelCount = modelDistribution[0]._count.modelName;
                  const width = (m._count.modelName / maxModelCount) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-body-muted w-4 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-body truncate">
                            {m.modelName}
                          </span>
                          {m.modelProvider && (
                            <span className="text-[10px] uppercase tracking-wider text-body-muted flex-shrink-0">
                              {m.modelProvider}
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${width}%`,
                              background: `linear-gradient(90deg, #88619A, #4298B4)`,
                              opacity: 0.5,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-body tabular-nums">
                        {m._count.modelName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up stagger-6">
            <h2 className="font-display text-lg font-semibold text-body mb-5">
              Recent Activity
            </h2>
            <div className="space-y-0">
              {recentTests.map((test, i) => {
                const group = getGroup(test.mbtiResult);
                const color = GROUP_CONFIG[group].color;
                return (
                  <Link
                    key={test.id}
                    href={`/result/${test.id}`}
                    className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors"
                  >
                    {/* Timeline */}
                    <div className="relative flex flex-col items-center pt-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-white z-10"
                        style={{ backgroundColor: color }}
                      />
                      {i < recentTests.length - 1 && (
                        <span className="w-px flex-1 min-h-[24px] bg-surface-200 mt-0.5" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color }}
                        >
                          {test.mbtiResult}
                        </span>
                        {test.agentName && (
                          <span className="text-xs text-body-muted truncate max-w-[120px]">
                            {test.agentName}
                          </span>
                        )}
                      </div>
                      {test.modelName && (
                        <p className="text-[11px] text-body-muted truncate mt-0.5">
                          {test.modelProvider ? `${test.modelProvider}/` : ''}
                          {test.modelName}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-body-muted whitespace-nowrap pt-1">
                      {timeAgo(test.createdAt)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===== PERFORMANCE INSIGHTS ===== */}
        {!hasBenchmarkData && !hasTelemetryData ? (
          <section className="stats-coming-soon rounded-2xl p-8 sm:p-10 text-center animate-fade-up">
            <div className="flex justify-center gap-2 mb-5">
              {['#88619A', '#33A474', '#4298B4', '#E4AE3A'].map((c) => (
                <span
                  key={c}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: c, opacity: 0.5 }}
                />
              ))}
            </div>
            <h3 className="font-display text-lg font-semibold text-body-light mb-2">
              Performance Insights
            </h3>
            <p className="text-sm text-body-muted max-w-lg mx-auto leading-relaxed mb-5">
              Run tests with the TruthfulQA benchmark to see which MBTI types are most accurate
              and which hallucinate the most.
            </p>
            <div className="max-w-sm mx-auto rounded-xl border border-surface-200 bg-white p-4 font-mono text-xs text-left">
              <p>
                <span className="text-body-muted select-none">$ </span>
                <span className="text-[#33A474]">npx</span>
                <span className="text-body-light"> ai-mbti-test run --prompt &quot;...&quot;</span>
              </p>
              <p className="text-body-muted mt-1 text-[10px]">
                TruthfulQA benchmark runs automatically
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Performance Summary Banner */}
            {hasBenchmarkData && (
              <section className="perf-banner rounded-2xl p-6 sm:p-8 animate-fade-up">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#33A474] animate-pulse" />
                  <h2 className="font-display text-lg font-semibold text-body">
                    Performance Insights
                  </h2>
                  <span className="text-[10px] font-mono text-body-muted ml-auto">
                    TruthfulQA Benchmark
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="perf-metric-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body-muted mb-1">
                      Benchmarked
                    </p>
                    <p className="font-display text-2xl font-semibold text-body">{totalBenchmarked}</p>
                    <p className="text-[10px] text-body-muted">tests</p>
                  </div>
                  <div className="perf-metric-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body-muted mb-1">
                      Avg Accuracy
                    </p>
                    <p className="font-display text-2xl font-semibold text-[#33A474]">
                      {overallAccuracy.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-body-muted">across all types</p>
                  </div>
                  <div className="perf-metric-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body-muted mb-1">
                      Hallucination
                    </p>
                    <p className="font-display text-2xl font-semibold text-[#C75D5D]">
                      {overallHallucination.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-body-muted">avg rate</p>
                  </div>
                  <div className="perf-metric-card">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-body-muted mb-1">
                      Best Type
                    </p>
                    <p className="font-display text-2xl font-semibold" style={{ color: benchmarkByType[0]?.color }}>
                      {benchmarkByType[0]?.type || '\u2014'}
                    </p>
                    <p className="text-[10px] text-body-muted">
                      {benchmarkByType[0] ? `${benchmarkByType[0].avgAccuracy.toFixed(1)}% accuracy` : ''}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Two-column: Accuracy by Type + Category / Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TruthfulQA Accuracy by MBTI Type */}
              {hasBenchmarkData && (
                <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up">
                  <h2 className="font-display text-lg font-semibold text-body mb-1">
                    Accuracy by Personality
                  </h2>
                  <p className="text-xs text-body-muted mb-5">
                    TruthfulQA benchmark accuracy per MBTI type
                  </p>
                  <div className="space-y-2.5">
                    {benchmarkByType.map((d, i) => (
                      <div key={d.type} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-body-muted w-4 text-right">
                          {i + 1}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="font-display font-bold text-sm text-body w-11">
                          {d.type}
                        </span>
                        <div className="flex-1 h-5 bg-surface-100 rounded-md overflow-hidden relative">
                          {/* Accuracy bar (green) */}
                          <div
                            className="absolute left-0 top-0 h-full rounded-md transition-all duration-700"
                            style={{
                              width: `${d.avgAccuracy}%`,
                              backgroundColor: '#33A474',
                              opacity: 0.6,
                            }}
                          />
                          {/* Hallucination overlay (red, from right) */}
                          <div
                            className="absolute right-0 top-0 h-full rounded-md transition-all duration-700"
                            style={{
                              width: `${d.avgHallucination}%`,
                              backgroundColor: '#C75D5D',
                              opacity: 0.25,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-mono font-semibold text-[#33A474] w-12 text-right tabular-nums">
                            {d.avgAccuracy.toFixed(1)}%
                          </span>
                          <span className="text-[10px] font-mono text-[#C75D5D] w-12 text-right tabular-nums">
                            {d.avgHallucination.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#33A474] opacity-60" />
                      <span className="text-[10px] text-body-muted">Accuracy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#C75D5D] opacity-25" />
                      <span className="text-[10px] text-body-muted">Hallucination</span>
                    </div>
                    <span className="text-[10px] text-body-muted ml-auto">
                      n per type shown
                    </span>
                  </div>
                </section>
              )}

              {/* Right column: Category Breakdown or Telemetry */}
              <div className="space-y-6">
                {/* Category Breakdown */}
                {hasBenchmarkData && categoryData.length > 0 && (
                  <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up">
                    <h2 className="font-display text-lg font-semibold text-body mb-1">
                      Accuracy by Category
                    </h2>
                    <p className="text-xs text-body-muted mb-5">
                      Performance across knowledge domains
                    </p>
                    <div className="space-y-3.5">
                      {categoryData.map((cat) => (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-body capitalize">
                              {cat.category}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-mono font-semibold text-body tabular-nums">
                                {cat.accuracy.toFixed(1)}%
                              </span>
                              <span className="text-[10px] font-mono text-body-muted">
                                ({cat.correct}/{cat.total})
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${cat.accuracy}%`,
                                background: cat.accuracy >= 70
                                  ? '#33A474'
                                  : cat.accuracy >= 40
                                  ? '#E4AE3A'
                                  : '#C75D5D',
                                opacity: 0.6,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Response Telemetry */}
                {hasTelemetryData && (
                  <section className="bg-white rounded-2xl border border-surface-300 p-6 shadow-sm animate-fade-up">
                    <h2 className="font-display text-lg font-semibold text-body mb-1">
                      Response Telemetry
                    </h2>
                    <p className="text-xs text-body-muted mb-5">
                      Average response time and retry rate per MBTI type
                    </p>
                    <div className="space-y-2">
                      {telemetryByType.map((d, i) => {
                        const maxLatency = Math.max(...telemetryByType.map((t) => t.avgLatency), 1);
                        const barWidth = (d.avgLatency / maxLatency) * 100;
                        return (
                          <div key={d.type} className="flex items-center gap-3">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="font-display font-bold text-sm text-body w-11">
                              {d.type}
                            </span>
                            <div className="flex-1 h-4 bg-surface-100 rounded-md overflow-hidden">
                              <div
                                className="h-full rounded-md transition-all duration-500"
                                style={{
                                  width: `${barWidth}%`,
                                  background: 'linear-gradient(90deg, #4298B4, #88619A)',
                                  opacity: 0.45,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-body tabular-nums w-16 text-right">
                              {d.avgLatency >= 1000
                                ? `${(d.avgLatency / 1000).toFixed(1)}s`
                                : `${Math.round(d.avgLatency)}ms`}
                            </span>
                            {d.avgRetries > 0 && (
                              <span className="text-[10px] font-mono text-[#E4AE3A] w-14 text-right tabular-nums">
                                {d.avgRetries.toFixed(1)} retry
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
