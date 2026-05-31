export const JOB_CHARACTERS = {
  developer: { emoji: '💻', label: '개발자', color: '#3B82F6' },
  production: { emoji: '👷', label: '생산/현장', color: '#F59E0B' },
  researcher: { emoji: '🧪', label: '연구원', color: '#8B5CF6' },
  office: { emoji: '🏢', label: '사무직', color: '#64748B' },
  sales: { emoji: '📞', label: '영업', color: '#EF4444' },
  marketer: { emoji: '🚀', label: '마케터', color: '#EC4899' },
  designer: { emoji: '🎨', label: '디자이너', color: '#F472B6' },
  planner: { emoji: '📝', label: '기획자', color: '#06B6D4' },
  hr: { emoji: '👥', label: '인사/총무', color: '#F97316' },
  finance: { emoji: '💰', label: '회계/재무', color: '#22C55E' },
  logistics: { emoji: '📦', label: '물류/구매', color: '#78350F' },
  service: { emoji: '🍽️', label: '서비스직', color: '#fbbf24' },
  medical: { emoji: '🏥', label: '의료', color: '#ef4444' },
  education: { emoji: '🎓', label: '교육', color: '#3b82f6' },
  business: { emoji: '🏪', label: '자영업', color: '#10b981' },
  student: { emoji: '✏️', label: '학생', color: '#6366f1' },
  freelancer: { emoji: '🏠', label: '프리랜서', color: '#8b5cf6' },
};

export type JobType = keyof typeof JOB_CHARACTERS;
export const JOB_STORAGE_KEY = '@job_type_preference';
export const JOIN_DATE_KEY = '@join_date_preference';
