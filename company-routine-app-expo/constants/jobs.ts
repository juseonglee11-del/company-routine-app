export const JOB_CHARACTERS = {
  developer: {
    emoji: '👨🏻‍💻',
    label: '개발자',
    color: '#3B82F6',
    secondaryColor: '#DBEAFE',
  },
  planner: {
    emoji: '📊',
    label: '기획자',
    color: '#0D9488',
    secondaryColor: '#CCFBF1',
  },
  designer: {
    emoji: '🎨',
    label: '디자이너',
    color: '#EC4899',
    secondaryColor: '#FCE7F3',
  },
  marketer: {
    emoji: '📢',
    label: '마케터',
    color: '#06B6D4',
    secondaryColor: '#CFFAFE',
  },
  sales: {
    emoji: '🤝',
    label: '영업',
    color: '#EF4444',
    secondaryColor: '#FEE2E2',
  },
  production: {
    emoji: '👷',
    label: '생산/현장',
    color: '#F59E0B',
    secondaryColor: '#FEF3C7',
  },
  researcher: {
    emoji: '🧪',
    label: '연구원',
    color: '#8B5CF6',
    secondaryColor: '#EDE9FE',
  },
  hr: {
    emoji: '📋',
    label: '인사/총무',
    color: '#F97316',
    secondaryColor: '#FFEDD5',
  },
  finance: {
    emoji: '💰',
    label: '회계/재무',
    color: '#16A34A',
    secondaryColor: '#DCFCE7',
  },
  education: {
    emoji: '📚',
    label: '교육',
    color: '#6366F1',
    secondaryColor: '#E0E7FF',
  },
  service: {
    emoji: '☕',
    label: '서비스직',
    color: '#B45309',
    secondaryColor: '#FEF3C7',
  },
  other: {
    emoji: '🌟',
    label: '기타',
    color: '#64748B',
    secondaryColor: '#F1F5F9',
  },
};

export type JobType = keyof typeof JOB_CHARACTERS;
export const JOB_STORAGE_KEY = '@job_type_preference';
export const JOIN_DATE_KEY = '@join_date_preference';
