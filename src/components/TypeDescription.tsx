import { mbtiDescriptions } from '@/lib/mbti-descriptions';
import { getGroupConfig } from '@/lib/group-colors';

interface Props {
  mbtiType: string;
}

export default function TypeDescription({ mbtiType }: Props) {
  const info = mbtiDescriptions[mbtiType];
  const group = getGroupConfig(mbtiType);
  if (!info) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
      <h3 className="text-xl font-bold text-body mb-1">{info.title}</h3>
      <p className="text-body-light mb-4 leading-relaxed">{info.description}</p>
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
  );
}
