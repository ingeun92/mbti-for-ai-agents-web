'use client';

import { getGroupConfig } from '@/lib/group-colors';

interface Props {
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  mbtiType: string;
}

interface DimensionPair {
  left: keyof Props['scores'];
  right: keyof Props['scores'];
}

const PAIRS: DimensionPair[] = [
  { left: 'E', right: 'I' },
  { left: 'S', right: 'N' },
  { left: 'T', right: 'F' },
  { left: 'J', right: 'P' },
];

export default function ScoreBreakdown({ scores, mbtiType }: Props) {
  const group = getGroupConfig(mbtiType);

  return (
    <div className="space-y-5">
      {PAIRS.map(({ left, right }) => {
        const leftVal = scores[left];
        const rightVal = scores[right];
        const total = leftVal + rightVal;
        const leftPct = total > 0 ? Math.round((leftVal / total) * 100) : 50;
        const rightPct = 100 - leftPct;
        const dominant = leftVal >= rightVal ? left : right;

        return (
          <div key={`${left}${right}`} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span
                className="font-bold text-base w-6 text-center"
                style={{ color: dominant === left ? group.color : '#9E9E9E' }}
              >
                {left}
              </span>
              <div className="flex-1 mx-3 flex items-center gap-1">
                <div className="flex-1 flex justify-end">
                  <div
                    className="h-3 rounded-l-full transition-all duration-500"
                    style={{
                      width: `${leftPct}%`,
                      backgroundColor: dominant === left ? group.color : '#EEEEEE',
                    }}
                  />
                </div>
                <div className="w-px h-5 bg-surface-300 flex-shrink-0" />
                <div className="flex-1 flex justify-start">
                  <div
                    className="h-3 rounded-r-full transition-all duration-500"
                    style={{
                      width: `${rightPct}%`,
                      backgroundColor: dominant === right ? group.color : '#EEEEEE',
                    }}
                  />
                </div>
              </div>
              <span
                className="font-bold text-base w-6 text-center"
                style={{ color: dominant === right ? group.color : '#9E9E9E' }}
              >
                {right}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-body-muted px-9">
              <span>{leftPct}%</span>
              <span>{rightPct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
