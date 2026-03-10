import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { mbtiDescriptions } from '@/lib/mbti-descriptions';
import { getGroupConfig } from '@/lib/group-colors';
import RadarChart from '@/components/RadarChart';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import TypeDescription from '@/components/TypeDescription';
import CopyButton from '@/components/CopyButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test) return { title: 'Result Not Found' };

  const info = mbtiDescriptions[test.mbtiResult];
  const title = `AI Agent MBTI: ${test.mbtiResult} - ${info?.title ?? ''}`;
  const description = `This AI agent's personality type is ${test.mbtiResult}. ${info?.description?.slice(0, 120) ?? ''}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test) notFound();

  const scores = test.scores as unknown as {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };

  const info = mbtiDescriptions[test.mbtiResult];
  const group = getGroupConfig(test.mbtiResult);

  return (
    <div>
      {/* Hero: MBTI Type - full-width colored banner */}
      <section className={`${group.bgClass} border-b border-surface-300`}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-up">
          <div className="flex justify-center mb-4">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: group.color }}>
            {group.name} &middot; AI Agent Personality
          </p>
          <h1
            className="font-display text-7xl sm:text-8xl lg:text-9xl font-semibold tracking-tight leading-none py-2 italic"
            style={{ color: group.color }}
          >
            {test.mbtiResult}
          </h1>
          {info && (
            <p className="text-2xl font-display text-body-light mt-3">{info.title}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Type Description */}
        <div className="animate-fade-up stagger-1">
          <TypeDescription mbtiType={test.mbtiResult} />
        </div>

        {/* Radar Chart */}
        <section className="bg-white rounded-2xl border border-surface-300 p-6 space-y-4 shadow-sm animate-fade-up stagger-2">
          <h2 className="text-lg font-bold text-body">Personality Radar</h2>
          <RadarChart scores={scores} mbtiType={test.mbtiResult} />
        </section>

        {/* Score Breakdown */}
        <section className="bg-white rounded-2xl border border-surface-300 p-6 space-y-4 shadow-sm animate-fade-up stagger-3">
          <h2 className="text-lg font-bold text-body">Dimension Breakdown</h2>
          <ScoreBreakdown scores={scores} mbtiType={test.mbtiResult} />
        </section>

        {/* AI Prompt Used */}
        <section className="rounded-2xl border border-surface-300 bg-surface-100 p-6 space-y-2 animate-fade-up stagger-4">
          <p className="text-xs font-bold text-body-muted uppercase tracking-widest">
            System Prompt Analyzed
          </p>
          <p className="text-body-light text-sm leading-relaxed break-words">
            {test.aiPrompt}
          </p>
        </section>

        {/* Share Section */}
        <section className="rounded-2xl border border-surface-300 bg-white p-6 space-y-4 text-center shadow-sm animate-fade-up stagger-5">
          <h2 className="text-lg font-bold text-body">Share This Result</h2>
          <p className="text-body-light text-sm">
            Show the world what personality type your AI agent is.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <code className="flex-1 max-w-md text-xs text-body-light bg-surface-100 border border-surface-300 rounded-xl px-4 py-3 break-all font-mono">
              /result/{id}
            </code>
            <CopyButton id={id} mbtiResult={test.mbtiResult} />
          </div>
        </section>

        {/* Footer note */}
        <p className="text-center text-body-muted text-xs">
          Tested on{' '}
          {new Date(test.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
