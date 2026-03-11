import { mbtiDescriptions } from '@/lib/mbti-descriptions';
import { getGroupConfig, getGroup } from '@/lib/group-colors';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

const VALID_TYPES = Object.keys(mbtiDescriptions);

const GROUP_TYPES: Record<string, string[]> = {
  analyst: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  diplomat: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  sentinel: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  explorer: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

interface Props {
  params: Promise<{ type: string }>;
}

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const upperType = type.toUpperCase();
  const info = mbtiDescriptions[upperType];

  if (!info) return { title: 'Type Not Found' };

  return {
    title: `${upperType} - ${info.title} | MBTI for AI Agents`,
    description: info.description.slice(0, 160),
    openGraph: {
      title: `${upperType} - ${info.title} | MBTI for AI Agents`,
      description: info.description.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function TypeDetailPage({ params }: Props) {
  const { type } = await params;
  const upperType = type.toUpperCase();
  const info = mbtiDescriptions[upperType];

  if (!info) notFound();

  const group = getGroupConfig(upperType);
  const groupKey = getGroup(upperType);
  const siblingTypes = GROUP_TYPES[groupKey].filter((t) => t !== upperType);

  return (
    <div>
      {/* Hero */}
      <section className={`${group.bgClass} border-b border-surface-300`}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center animate-fade-up">
          <div className="flex justify-center mb-4">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
          </div>
          <p
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ color: group.color }}
          >
            {group.name}
          </p>
          <h1
            className="font-display text-7xl sm:text-8xl lg:text-9xl font-semibold tracking-tight leading-none py-2"
            style={{ color: group.color }}
          >
            {upperType}
          </h1>
          <p className="text-2xl font-display text-body-light mt-3">{info.title}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Description & Traits */}
        <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm animate-fade-up stagger-1">
          <h2 className="text-xl font-bold text-body mb-3">{info.title}</h2>
          <p className="text-body-light mb-5 leading-relaxed">{info.description}</p>
          <div className="flex flex-wrap gap-2">
            {info.traits.map((trait) => (
              <span
                key={trait}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${group.badgeClass}`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Other types in this group */}
        <section className="animate-fade-up stagger-2">
          <h2 className="text-lg font-bold text-body mb-4">
            Other <span style={{ color: group.color }}>{group.name}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {siblingTypes.map((t) => {
              const sibInfo = mbtiDescriptions[t];
              return (
                <Link
                  key={t}
                  href={`/types/${t}`}
                  className="bg-white rounded-2xl border border-surface-300 p-5 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3 mx-auto text-white font-bold text-lg"
                    style={{ backgroundColor: group.color }}
                  >
                    {t.slice(0, 2)}
                  </div>
                  <div
                    className="text-sm font-bold tracking-wide"
                    style={{ color: group.color }}
                  >
                    {t}
                  </div>
                  <div className="text-base font-bold text-body mt-0.5">{sibInfo?.title}</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-surface-300 bg-white p-8 text-center shadow-sm animate-fade-up stagger-3">
          <h2 className="text-xl font-bold text-body mb-2">Test Your AI Agent</h2>
          <p className="text-body-light text-sm mb-5">
            Run the CLI tool to discover your AI agent&apos;s personality type
          </p>
          <div className="max-w-sm mx-auto bg-surface-50 rounded-xl border border-surface-300 px-5 py-3 font-mono text-sm text-left">
            <span className="text-body-muted select-none">$ </span>
            <span className="text-diplomat">npx</span>
            <span className="text-body"> ai-mbti-test</span>
          </div>
        </section>
      </div>
    </div>
  );
}
