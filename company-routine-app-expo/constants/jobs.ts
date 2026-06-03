export interface JobCharacter {
  emoji: string;
  label: string;
  color: string;
  secondaryColor: string;
}

export const JOB_CHARACTERS: Record<string, JobCharacter> = {
  // 💻 IT·개발
  frontend_dev:   { emoji: '💻', label: '프론트엔드 개발자',   color: '#3B82F6', secondaryColor: '#DBEAFE' },
  backend_dev:    { emoji: '⚙️',  label: '백엔드 개발자',       color: '#6366F1', secondaryColor: '#E0E7FF' },
  mobile_dev:     { emoji: '📱', label: '모바일 개발자',       color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  devops:         { emoji: '🔧', label: 'DevOps/인프라',       color: '#0D9488', secondaryColor: '#CCFBF1' },
  data_engineer:  { emoji: '📊', label: '데이터 엔지니어',     color: '#2563EB', secondaryColor: '#DBEAFE' },
  ml_engineer:    { emoji: '🤖', label: 'AI/ML 엔지니어',      color: '#7C3AED', secondaryColor: '#EDE9FE' },
  security_eng:   { emoji: '🛡️', label: '보안 엔지니어',       color: '#DC2626', secondaryColor: '#FEE2E2' },
  qa_dev:         { emoji: '🔍', label: 'QA 엔지니어',         color: '#059669', secondaryColor: '#DCFCE7' },
  pm_it:          { emoji: '🎯', label: '프로덕트 매니저(PM)', color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  tech_support:   { emoji: '💡', label: 'IT 기술지원',         color: '#F59E0B', secondaryColor: '#FEF3C7' },

  // 🏭 생산·품질
  production_mgr:  { emoji: '🏭', label: '생산관리',              color: '#F59E0B', secondaryColor: '#FEF3C7' },
  production_tech: { emoji: '⚙️',  label: '생산기술',              color: '#D97706', secondaryColor: '#FEF3C7' },
  process_tech:    { emoji: '🔬', label: '공정기술',              color: '#B45309', secondaryColor: '#FEF3C7' },
  facility_eng:    { emoji: '🔧', label: '설비엔지니어',          color: '#92400E', secondaryColor: '#FEF3C7' },
  qc:              { emoji: '📋', label: '품질관리(QC)',           color: '#065F46', secondaryColor: '#DCFCE7' },
  qa_mfg:          { emoji: '✅', label: '품질보증(QA)',           color: '#047857', secondaryColor: '#DCFCE7' },
  pqc:             { emoji: '🔍', label: '공정품질관리(PQC)',      color: '#0D9488', secondaryColor: '#CCFBF1' },
  sqe:             { emoji: '🤝', label: '협력사품질관리(SQE)',    color: '#0891B2', secondaryColor: '#E0F2FE' },
  mfg_eng:         { emoji: '⚒️', label: '제조기술 엔지니어',     color: '#7C3AED', secondaryColor: '#EDE9FE' },
  inspector:       { emoji: '🔎', label: '검사원',                color: '#64748B', secondaryColor: '#F1F5F9' },

  // 📈 영업·마케팅
  sales:            { emoji: '🤝', label: '영업',            color: '#EF4444', secondaryColor: '#FEE2E2' },
  key_account:      { emoji: '💼', label: '핵심거래처(KAM)', color: '#DC2626', secondaryColor: '#FEE2E2' },
  trade:            { emoji: '✈️', label: '무역·수출입',      color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  marketer:         { emoji: '📢', label: '마케터',           color: '#06B6D4', secondaryColor: '#CFFAFE' },
  digital_marketer: { emoji: '📱', label: '디지털마케터',     color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  brand_mgr:        { emoji: '🎨', label: '브랜드 매니저',    color: '#EC4899', secondaryColor: '#FCE7F3' },
  crm:              { emoji: '💬', label: 'CRM/고객관리',     color: '#F97316', secondaryColor: '#FFEDD5' },
  pr_comm:          { emoji: '📣', label: 'PR/홍보',          color: '#7C3AED', secondaryColor: '#EDE9FE' },

  // 🏢 사무·경영지원
  hr:               { emoji: '👥', label: '인사(HR)',       color: '#F97316', secondaryColor: '#FFEDD5' },
  general_affairs:  { emoji: '📋', label: '총무',           color: '#EA580C', secondaryColor: '#FFEDD5' },
  finance_acc:      { emoji: '💰', label: '재무·회계',      color: '#16A34A', secondaryColor: '#DCFCE7' },
  legal:            { emoji: '⚖️', label: '법무',           color: '#6366F1', secondaryColor: '#E0E7FF' },
  biz_planner:      { emoji: '📊', label: '경영기획',       color: '#0D9488', secondaryColor: '#CCFBF1' },
  ir:               { emoji: '📈', label: 'IR(투자관계)',   color: '#2563EB', secondaryColor: '#DBEAFE' },
  admin:            { emoji: '🗂️', label: '행정',           color: '#64748B', secondaryColor: '#F1F5F9' },
  civil_servant:    { emoji: '🏛️', label: '공무원',         color: '#2563EB', secondaryColor: '#DBEAFE' },
  secretary:        { emoji: '📅', label: '비서',           color: '#EC4899', secondaryColor: '#FCE7F3' },

  // 🎨 디자인·기획
  ux_designer:       { emoji: '🎨', label: 'UX/UI 디자이너',  color: '#EC4899', secondaryColor: '#FCE7F3' },
  graphic_designer:  { emoji: '🖼️', label: '그래픽 디자이너', color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  product_designer:  { emoji: '📐', label: '제품 디자이너',   color: '#6366F1', secondaryColor: '#E0E7FF' },
  motion_designer:   { emoji: '🎬', label: '모션 디자이너',   color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  content_planner:   { emoji: '📝', label: '콘텐츠 기획자',   color: '#0D9488', secondaryColor: '#CCFBF1' },
  service_planner:   { emoji: '🎯', label: '서비스 기획자',   color: '#2563EB', secondaryColor: '#DBEAFE' },
  md:                { emoji: '🛍️', label: 'MD(머천다이저)',   color: '#F97316', secondaryColor: '#FFEDD5' },

  // ✈️ 서비스·관광
  cabin_crew:       { emoji: '✈️', label: '객실승무원',   color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  hotel_staff:      { emoji: '🏨', label: '호텔리어',     color: '#7C3AED', secondaryColor: '#EDE9FE' },
  food_service:     { emoji: '🍽️', label: '외식/요식업',  color: '#F97316', secondaryColor: '#FFEDD5' },
  retail:           { emoji: '🛒', label: '판매·유통',    color: '#EF4444', secondaryColor: '#FEE2E2' },
  beauty:           { emoji: '💄', label: '뷰티·미용',    color: '#EC4899', secondaryColor: '#FCE7F3' },
  travel_agent:     { emoji: '🗺️', label: '여행사 직원',  color: '#06B6D4', secondaryColor: '#CFFAFE' },
  customer_service: { emoji: '😊', label: '고객서비스',   color: '#16A34A', secondaryColor: '#DCFCE7' },

  // 🏥 의료·보건
  doctor:       { emoji: '👨‍⚕️', label: '의사',       color: '#DC2626', secondaryColor: '#FEE2E2' },
  nurse:        { emoji: '💊', label: '간호사',     color: '#EC4899', secondaryColor: '#FCE7F3' },
  pharmacist:   { emoji: '🧪', label: '약사',       color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  therapist:    { emoji: '🦴', label: '물리치료사', color: '#0D9488', secondaryColor: '#CCFBF1' },
  radiologist:  { emoji: '☢️', label: '방사선사',   color: '#6366F1', secondaryColor: '#E0E7FF' },
  clinical_lab: { emoji: '🔬', label: '임상병리사', color: '#059669', secondaryColor: '#DCFCE7' },
  care_worker:           { emoji: '🤲', label: '요양보호사',   color: '#F97316', secondaryColor: '#FFEDD5' },
  dentist:               { emoji: '🦷', label: '치과의사',     color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  oriental_doctor:       { emoji: '🌿', label: '한의사',       color: '#16A34A', secondaryColor: '#DCFCE7' },
  veterinarian:          { emoji: '🐾', label: '수의사',       color: '#F59E0B', secondaryColor: '#FEF3C7' },
  occupational_therapist:{ emoji: '🖐️', label: '작업치료사',  color: '#0D9488', secondaryColor: '#CCFBF1' },
  speech_therapist:      { emoji: '💬', label: '언어치료사',   color: '#7C3AED', secondaryColor: '#EDE9FE' },
  dental_hygienist:      { emoji: '🪥', label: '치위생사',     color: '#06B6D4', secondaryColor: '#CFFAFE' },
  dietitian:             { emoji: '🥗', label: '영양사',       color: '#059669', secondaryColor: '#DCFCE7' },

  // 📚 교육
  teacher_school: { emoji: '📚', label: '초중고 교사',     color: '#6366F1', secondaryColor: '#E0E7FF' },
  professor:      { emoji: '🎓', label: '대학교수',        color: '#7C3AED', secondaryColor: '#EDE9FE' },
  private_tutor:  { emoji: '✏️', label: '학원 강사',       color: '#F59E0B', secondaryColor: '#FEF3C7' },
  trainer_corp:   { emoji: '💼', label: '기업 강사/HRD',   color: '#0D9488', secondaryColor: '#CCFBF1' },
  instructor:     { emoji: '🏃', label: '스포츠/예체능 강사', color: '#EF4444', secondaryColor: '#FEE2E2' },
  edu_planner:    { emoji: '📋', label: '교육 기획자',     color: '#2563EB', secondaryColor: '#DBEAFE' },

  // ⚖️ 전문직
  lawyer:          { emoji: '⚖️', label: '변호사/법무사',    color: '#6366F1', secondaryColor: '#E0E7FF' },
  prosecutor:      { emoji: '🔏', label: '검사',             color: '#DC2626', secondaryColor: '#FEE2E2' },
  judge:           { emoji: '🏛️', label: '판사',             color: '#4F46E5', secondaryColor: '#E0E7FF' },
  accountant:      { emoji: '💰', label: '공인회계사(CPA)',  color: '#16A34A', secondaryColor: '#DCFCE7' },
  tax_accountant:  { emoji: '📋', label: '세무사',           color: '#059669', secondaryColor: '#DCFCE7' },
  architect_pro:   { emoji: '🏛️', label: '건축사',           color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  patent_attorney: { emoji: '💡', label: '변리사',           color: '#F59E0B', secondaryColor: '#FEF3C7' },
  consultant:       { emoji: '🔍', label: '경영컨설턴트',  color: '#7C3AED', secondaryColor: '#EDE9FE' },
  actuary:          { emoji: '📊', label: '보험계리사',    color: '#64748B', secondaryColor: '#F1F5F9' },
  labor_attorney:   { emoji: '📜', label: '노무사',        color: '#DC2626', secondaryColor: '#FEE2E2' },
  real_estate_agent:{ emoji: '🏠', label: '공인중개사',    color: '#F97316', secondaryColor: '#FFEDD5' },
  appraiser:        { emoji: '💎', label: '감정평가사',    color: '#0891B2', secondaryColor: '#E0F2FE' },
  customs_broker:   { emoji: '🛂', label: '관세사',        color: '#0D9488', secondaryColor: '#CCFBF1' },
  admin_agent:      { emoji: '📝', label: '행정사',        color: '#6366F1', secondaryColor: '#E0E7FF' },
  social_worker:    { emoji: '🤝', label: '사회복지사',    color: '#EC4899', secondaryColor: '#FCE7F3' },
  counselor:        { emoji: '💭', label: '심리상담사',    color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  financial_planner:{ emoji: '📈', label: '재무설계사',    color: '#16A34A', secondaryColor: '#DCFCE7' },

  // 🏗️ 건설·설계
  civil_engineer:  { emoji: '🏗️', label: '토목 엔지니어',     color: '#F59E0B', secondaryColor: '#FEF3C7' },
  architect_eng:   { emoji: '🏠', label: '건축 엔지니어',     color: '#EA580C', secondaryColor: '#FFEDD5' },
  structural_eng:  { emoji: '🔩', label: '구조 엔지니어',     color: '#B45309', secondaryColor: '#FEF3C7' },
  mechanical_eng:  { emoji: '⚙️',  label: '기계 엔지니어',     color: '#7C3AED', secondaryColor: '#EDE9FE' },
  electrical_eng:  { emoji: '⚡', label: '전기 엔지니어',     color: '#F59E0B', secondaryColor: '#FEF3C7' },
  cad_designer:    { emoji: '📐', label: 'CAD 설계자',         color: '#6366F1', secondaryColor: '#E0E7FF' },
  site_manager:    { emoji: '👷', label: '현장소장/공사관리', color: '#D97706', secondaryColor: '#FEF3C7' },

  // 🎬 미디어·콘텐츠
  journalist:   { emoji: '📰', label: '기자/PD',          color: '#64748B', secondaryColor: '#F1F5F9' },
  youtuber:     { emoji: '🎬', label: '유튜버/크리에이터', color: '#EF4444', secondaryColor: '#FEE2E2' },
  copywriter:   { emoji: '✍️', label: '카피라이터',        color: '#0D9488', secondaryColor: '#CCFBF1' },
  photographer: { emoji: '📷', label: '포토그래퍼',        color: '#6366F1', secondaryColor: '#E0E7FF' },
  video_editor: { emoji: '🎞️', label: '영상 편집자',       color: '#7C3AED', secondaryColor: '#EDE9FE' },
  social_media: { emoji: '📱', label: '소셜미디어 운영자', color: '#EC4899', secondaryColor: '#FCE7F3' },

  // 🚚 물류·구매·SCM
  logistics_mgr:  { emoji: '🚚', label: '물류관리',       color: '#F59E0B', secondaryColor: '#FEF3C7' },
  buyer:          { emoji: '🛒', label: '구매',           color: '#7C3AED', secondaryColor: '#EDE9FE' },
  scm:            { emoji: '🔗', label: 'SCM/공급망관리', color: '#0D9488', secondaryColor: '#CCFBF1' },
  warehouse:      { emoji: '🏪', label: '창고관리',       color: '#64748B', secondaryColor: '#F1F5F9' },
  export_import:  { emoji: '✈️', label: '수출입/통관',    color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  fleet_mgr:      { emoji: '🚛', label: '차량/운송관리',  color: '#D97706', secondaryColor: '#FEF3C7' },
  demand_planner: { emoji: '📊', label: '수요계획',       color: '#2563EB', secondaryColor: '#DBEAFE' },

  // 👨‍💼 자영업·프리랜서
  self_employed:   { emoji: '🏪', label: '자영업자',       color: '#F97316', secondaryColor: '#FFEDD5' },
  freelancer:      { emoji: '💼', label: '프리랜서',       color: '#6366F1', secondaryColor: '#E0E7FF' },
  startup_founder: { emoji: '🚀', label: '스타트업 창업자', color: '#0EA5E9', secondaryColor: '#E0F2FE' },
  online_seller:   { emoji: '🛍️', label: '온라인 셀러',   color: '#EC4899', secondaryColor: '#FCE7F3' },
  side_job:        { emoji: '💡', label: '부업·투잡',      color: '#16A34A', secondaryColor: '#DCFCE7' },

  // 🎓 대학생·취준생
  university_student: { emoji: '🎓', label: '대학생',       color: '#8B5CF6', secondaryColor: '#EDE9FE' },
  job_seeker:         { emoji: '📝', label: '취준생',       color: '#6366F1', secondaryColor: '#E0E7FF' },
  intern:             { emoji: '👔', label: '인턴',         color: '#0D9488', secondaryColor: '#CCFBF1' },
  grad_student:       { emoji: '🔬', label: '대학원생',     color: '#7C3AED', secondaryColor: '#EDE9FE' },
  career_changer:     { emoji: '🔄', label: '이직 준비생',  color: '#F59E0B', secondaryColor: '#FEF3C7' },
};

export type JobType = keyof typeof JOB_CHARACTERS;
export const JOB_STORAGE_KEY = '@job_type_preference';
export const JOIN_DATE_KEY = '@join_date_preference';

export const JOB_CATEGORIES: Array<{
  key: string;
  emoji: string;
  label: string;
  jobKeys: JobType[];
}> = [
  {
    key: 'it',
    emoji: '💻',
    label: 'IT·개발',
    jobKeys: ['frontend_dev', 'backend_dev', 'mobile_dev', 'devops', 'data_engineer', 'ml_engineer', 'security_eng', 'qa_dev', 'pm_it', 'tech_support'],
  },
  {
    key: 'manufacturing',
    emoji: '🏭',
    label: '생산·품질',
    jobKeys: ['production_mgr', 'production_tech', 'process_tech', 'facility_eng', 'qc', 'qa_mfg', 'pqc', 'sqe', 'mfg_eng', 'inspector'],
  },
  {
    key: 'sales_marketing',
    emoji: '📈',
    label: '영업·마케팅',
    jobKeys: ['sales', 'key_account', 'trade', 'marketer', 'digital_marketer', 'brand_mgr', 'crm', 'pr_comm'],
  },
  {
    key: 'office',
    emoji: '🏢',
    label: '사무·경영지원',
    jobKeys: ['hr', 'general_affairs', 'finance_acc', 'legal', 'biz_planner', 'ir', 'admin', 'civil_servant', 'secretary'],
  },
  {
    key: 'design',
    emoji: '🎨',
    label: '디자인·기획',
    jobKeys: ['ux_designer', 'graphic_designer', 'product_designer', 'motion_designer', 'content_planner', 'service_planner', 'md'],
  },
  {
    key: 'service',
    emoji: '✈️',
    label: '서비스·관광',
    jobKeys: ['cabin_crew', 'hotel_staff', 'food_service', 'retail', 'beauty', 'travel_agent', 'customer_service'],
  },
  {
    key: 'medical',
    emoji: '🏥',
    label: '의료·보건',
    jobKeys: ['doctor', 'dentist', 'oriental_doctor', 'veterinarian', 'nurse', 'pharmacist', 'therapist', 'occupational_therapist', 'speech_therapist', 'radiologist', 'clinical_lab', 'dental_hygienist', 'dietitian', 'care_worker'],
  },
  {
    key: 'education',
    emoji: '📚',
    label: '교육',
    jobKeys: ['teacher_school', 'professor', 'private_tutor', 'trainer_corp', 'instructor', 'edu_planner'],
  },
  {
    key: 'professional',
    emoji: '⚖️',
    label: '전문직',
    jobKeys: ['lawyer', 'prosecutor', 'judge', 'labor_attorney', 'accountant', 'tax_accountant', 'real_estate_agent', 'appraiser', 'customs_broker', 'admin_agent', 'architect_pro', 'patent_attorney', 'consultant', 'actuary', 'social_worker', 'counselor', 'financial_planner'],
  },
  {
    key: 'construction',
    emoji: '🏗️',
    label: '건설·설계',
    jobKeys: ['civil_engineer', 'architect_eng', 'structural_eng', 'mechanical_eng', 'electrical_eng', 'cad_designer', 'site_manager'],
  },
  {
    key: 'media',
    emoji: '🎬',
    label: '미디어·콘텐츠',
    jobKeys: ['journalist', 'youtuber', 'copywriter', 'photographer', 'video_editor', 'social_media'],
  },
  {
    key: 'logistics',
    emoji: '🚚',
    label: '물류·구매·SCM',
    jobKeys: ['logistics_mgr', 'buyer', 'scm', 'warehouse', 'export_import', 'fleet_mgr', 'demand_planner'],
  },
  {
    key: 'self_employed_cat',
    emoji: '👨‍💼',
    label: '자영업·프리랜서',
    jobKeys: ['self_employed', 'freelancer', 'startup_founder', 'online_seller', 'side_job'],
  },
  {
    key: 'student',
    emoji: '🎓',
    label: '대학생·취준생',
    jobKeys: ['university_student', 'job_seeker', 'intern', 'grad_student', 'career_changer'],
  },
];
