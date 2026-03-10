export type MbtiGroup = 'analyst' | 'diplomat' | 'sentinel' | 'explorer';

const TYPE_TO_GROUP: Record<string, MbtiGroup> = {
  INTJ: 'analyst', INTP: 'analyst', ENTJ: 'analyst', ENTP: 'analyst',
  INFJ: 'diplomat', INFP: 'diplomat', ENFJ: 'diplomat', ENFP: 'diplomat',
  ISTJ: 'sentinel', ISFJ: 'sentinel', ESTJ: 'sentinel', ESFJ: 'sentinel',
  ISTP: 'explorer', ISFP: 'explorer', ESTP: 'explorer', ESFP: 'explorer',
};

export const GROUP_CONFIG = {
  analyst: {
    name: 'Analysts',
    color: '#88619A',
    light: '#F4EFF6',
    bgClass: 'group-bg-analyst',
    textClass: 'text-analyst',
    badgeClass: 'bg-analyst/10 text-analyst-dark border-analyst/15',
  },
  diplomat: {
    name: 'Diplomats',
    color: '#33A474',
    light: '#EDF8F2',
    bgClass: 'group-bg-diplomat',
    textClass: 'text-diplomat',
    badgeClass: 'bg-diplomat/10 text-diplomat-dark border-diplomat/15',
  },
  sentinel: {
    name: 'Sentinels',
    color: '#4298B4',
    light: '#EDF5F8',
    bgClass: 'group-bg-sentinel',
    textClass: 'text-sentinel',
    badgeClass: 'bg-sentinel/10 text-sentinel-dark border-sentinel/15',
  },
  explorer: {
    name: 'Explorers',
    color: '#E4AE3A',
    light: '#FDF6E8',
    bgClass: 'group-bg-explorer',
    textClass: 'text-explorer',
    badgeClass: 'bg-explorer/10 text-explorer-dark border-explorer/15',
  },
} as const;

export function getGroup(mbtiType: string): MbtiGroup {
  return TYPE_TO_GROUP[mbtiType] ?? 'analyst';
}

export function getGroupConfig(mbtiType: string) {
  return GROUP_CONFIG[getGroup(mbtiType)];
}
