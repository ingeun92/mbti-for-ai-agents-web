'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
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

export default function RadarChart({ scores, mbtiType }: Props) {
  const group = getGroupConfig(mbtiType);

  const data = [
    { dimension: 'E', value: scores.E, fullMark: 105 },
    { dimension: 'N', value: scores.N, fullMark: 105 },
    { dimension: 'F', value: scores.F, fullMark: 105 },
    { dimension: 'P', value: scores.P, fullMark: 105 },
    { dimension: 'I', value: scores.I, fullMark: 105 },
    { dimension: 'S', value: scores.S, fullMark: 105 },
    { dimension: 'T', value: scores.T, fullMark: 105 },
    { dimension: 'J', value: scores.J, fullMark: 105 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#E0E0E0" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#6B6B6B', fontSize: 14, fontWeight: 700 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 105]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke={group.color}
          fill={group.color}
          fillOpacity={0.2}
          strokeWidth={2.5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E8E8',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ color: '#2D2D2D', fontWeight: 600 }}
          itemStyle={{ color: group.color }}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
