import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import { mbtiDescriptions } from '@/lib/mbti-descriptions';

export const runtime = 'nodejs';
export const alt = 'MBTI Result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const test = await prisma.test.findUnique({ where: { id } });

  const mbtiType = test?.mbtiResult ?? '????';
  const info = test ? mbtiDescriptions[test.mbtiResult] : null;
  const title = info?.title ?? 'Unknown Type';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 50%, #0f0f1a 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Header */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: '20px', fontWeight: 600 }}>
            MBTI for AI Agents
          </span>
          <span
            style={{
              color: '#8b5cf6',
              fontSize: '16px',
              fontWeight: 500,
              padding: '4px 14px',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '999px',
              background: 'rgba(139,92,246,0.1)',
            }}
          >
            AI Personality Test
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '160px',
              fontWeight: 900,
              lineHeight: 1,
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-4px',
            }}
          >
            {mbtiType}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 600,
              color: '#d1d5db',
              letterSpacing: '2px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#4b5563', fontSize: '18px' }}>
            mbti.ai/result/{id}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
