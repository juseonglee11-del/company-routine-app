import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAppTheme } from '../_layout';

// ── Storage keys ─────────────────────────────────────────────────
const CAREER_KEY = '@career_entries_v2';
const CERT_KEY = '@cert_entries_v2';

// ── Types ─────────────────────────────────────────────────────────
export interface CareerEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;   // "yyyy-MM-dd"
  endDate: string;     // "yyyy-MM-dd" | ""
  isCurrent: boolean;
  tasks: string;
  achievements: string;
}

export type CertType = 'national' | 'private' | 'language' | 'other';

export interface CertEntry {
  id: string;
  type: CertType;
  name: string;
  acquiredDate: string;
  expiryDate: string;  // "" = 만료 없음
  issuer: string;
  memo: string;
}

// ── Constants ─────────────────────────────────────────────────────
const CERT_TYPE_LABELS: Record<CertType, string> = {
  national: '국가자격증',
  private: '민간자격증',
  language: '어학',
  other: '기타',
};

const CERT_TYPE_COLORS: Record<CertType, string> = {
  national: '#3B82F6',
  private: '#10B981',
  language: '#8B5CF6',
  other: '#64748B',
};

// ── Helpers ───────────────────────────────────────────────────────
const calcTenureDays = (startDate: string, endDate: string, isCurrent: boolean): number => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = isCurrent || !endDate ? new Date() : new Date(endDate);
  return Math.max(0, differenceInDays(end, start) + 1);
};

const formatTenure = (days: number): string => {
  if (days <= 0) return '0일';
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const d = days % 30;
  if (years > 0) return months > 0 ? `${years}년 ${months}개월` : `${years}년`;
  if (months > 0) return d > 0 ? `${months}개월 ${d}일` : `${months}개월`;
  return `${days}일`;
};

const fmtDate = (s: string) => (s ? format(new Date(s), 'yyyy.MM.dd') : '');

// ── CareerFormModal ───────────────────────────────────────────────
const EMPTY_CAREER: Omit<CareerEntry, 'id'> = {
  companyName: '', jobTitle: '',
  startDate: '', endDate: '',
  isCurrent: true, tasks: '', achievements: '',
};

interface CareerFormProps {
  visible: boolean;
  entry: CareerEntry | null;
  colors: any;
  onSave: (e: CareerEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

function CareerFormModal({ visible, entry, colors, onSave, onDelete, onClose }: CareerFormProps) {
  const [form, setForm] = useState<Omit<CareerEntry, 'id'>>(EMPTY_CAREER);
  const [picker, setPicker] = useState<'start' | 'end' | null>(null);
  const isNew = !entry;

  useEffect(() => {
    if (visible) setForm(entry ? { ...entry } : { ...EMPTY_CAREER });
  }, [visible, entry]);

  const pickerDate = () => {
    if (picker === 'start') return form.startDate ? new Date(form.startDate) : new Date();
    if (picker === 'end')   return form.endDate   ? new Date(form.endDate)   : new Date();
    return new Date();
  };

  const confirmPicker = (date: Date) => {
    const s = format(date, 'yyyy-MM-dd');
    if (picker === 'start') setForm(f => ({ ...f, startDate: s }));
    if (picker === 'end')   setForm(f => ({ ...f, endDate: s }));
    setPicker(null);
  };

  const canSave = form.companyName.trim().length > 0 && form.startDate.length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({
      id: entry?.id ?? Date.now().toString(),
      ...form,
      companyName: form.companyName.trim(),
      jobTitle: form.jobTitle.trim(),
      endDate: form.isCurrent ? '' : form.endDate,
    });
  };

  const confirmDelete = () =>
    Alert.alert('경력 삭제', '이 경력을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: onDelete },
    ]);

  const bg = colors.background;
  const card = colors.card;
  const border = colors.border;
  const primary = colors.primary;
  const textMain = colors.textMain;
  const textSub = colors.textSub;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header */}
          <View style={[fStyles.header, { borderBottomColor: border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[fStyles.navText, { color: textSub }]}>취소</Text>
            </TouchableOpacity>
            <Text style={[fStyles.headerTitle, { color: textMain }]}>{isNew ? '경력 추가' : '경력 수정'}</Text>
            <TouchableOpacity onPress={save} disabled={!canSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[fStyles.navText, { color: canSave ? primary : border }]}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={fStyles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* 회사명 */}
            <Text style={[fStyles.label, { color: textSub }]}>회사명 *</Text>
            <TextInput
              style={[fStyles.input, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="회사명을 입력해주세요"
              placeholderTextColor={textSub}
              value={form.companyName}
              onChangeText={v => setForm(f => ({ ...f, companyName: v }))}
            />

            {/* 직무 */}
            <Text style={[fStyles.label, { color: textSub }]}>직무 / 직종</Text>
            <TextInput
              style={[fStyles.input, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="직무 또는 직종을 입력해주세요"
              placeholderTextColor={textSub}
              value={form.jobTitle}
              onChangeText={v => setForm(f => ({ ...f, jobTitle: v }))}
            />

            {/* 재직중 토글 */}
            <View style={[fStyles.switchRow, { borderColor: border }]}>
              <Text style={[fStyles.switchLabel, { color: textMain }]}>현재 재직 중</Text>
              <Switch
                value={form.isCurrent}
                onValueChange={v => setForm(f => ({ ...f, isCurrent: v }))}
                trackColor={{ false: border, true: primary + '55' }}
                thumbColor={form.isCurrent ? primary : textSub}
              />
            </View>

            {/* 입사일 */}
            <Text style={[fStyles.label, { color: textSub }]}>입사일 *</Text>
            <TouchableOpacity
              style={[fStyles.datePicker, { backgroundColor: card, borderColor: form.startDate ? primary : border }]}
              onPress={() => setPicker('start')}
            >
              <Ionicons name="calendar-outline" size={18} color={form.startDate ? primary : textSub} />
              <Text style={[fStyles.dateText, { color: form.startDate ? textMain : textSub }]}>
                {form.startDate ? fmtDate(form.startDate) : '입사일 선택'}
              </Text>
            </TouchableOpacity>

            {/* 퇴사일 (재직중이 아닐 때) */}
            {!form.isCurrent && (
              <>
                <Text style={[fStyles.label, { color: textSub }]}>퇴사일</Text>
                <TouchableOpacity
                  style={[fStyles.datePicker, { backgroundColor: card, borderColor: form.endDate ? primary : border }]}
                  onPress={() => setPicker('end')}
                >
                  <Ionicons name="calendar-outline" size={18} color={form.endDate ? primary : textSub} />
                  <Text style={[fStyles.dateText, { color: form.endDate ? textMain : textSub }]}>
                    {form.endDate ? fmtDate(form.endDate) : '퇴사일 선택'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* 주요 업무 */}
            <Text style={[fStyles.label, { color: textSub }]}>주요 업무</Text>
            <TextInput
              style={[fStyles.textarea, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="맡았던 주요 업무를 입력하세요"
              placeholderTextColor={textSub}
              value={form.tasks}
              onChangeText={v => setForm(f => ({ ...f, tasks: v }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* 주요 성과 */}
            <Text style={[fStyles.label, { color: textSub }]}>주요 성과</Text>
            <TextInput
              style={[fStyles.textarea, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="성과나 특이사항을 메모하세요"
              placeholderTextColor={textSub}
              value={form.achievements}
              onChangeText={v => setForm(f => ({ ...f, achievements: v }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {!isNew && (
              <TouchableOpacity style={fStyles.deleteRow} onPress={confirmDelete}>
                <Text style={fStyles.deleteText}>이 경력 삭제</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {picker !== null && (
          <DateTimePickerModal
            isVisible
            mode="date"
            date={pickerDate()}
            onConfirm={confirmPicker}
            onCancel={() => setPicker(null)}
            maximumDate={picker === 'start' ? new Date() : undefined}
            minimumDate={new Date(1970, 0, 1)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ── CertFormModal ─────────────────────────────────────────────────
const EMPTY_CERT: Omit<CertEntry, 'id'> = {
  type: 'national', name: '',
  acquiredDate: '', expiryDate: '',
  issuer: '', memo: '',
};

interface CertFormProps {
  visible: boolean;
  entry: CertEntry | null;
  colors: any;
  onSave: (e: CertEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

function CertFormModal({ visible, entry, colors, onSave, onDelete, onClose }: CertFormProps) {
  const [form, setForm] = useState<Omit<CertEntry, 'id'>>(EMPTY_CERT);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [picker, setPicker] = useState<'acquired' | 'expiry' | null>(null);
  const isNew = !entry;

  useEffect(() => {
    if (visible) {
      setForm(entry ? { ...entry } : { ...EMPTY_CERT });
      setHasExpiry(!!entry?.expiryDate);
    }
  }, [visible, entry]);

  const pickerDate = () => {
    if (picker === 'acquired') return form.acquiredDate ? new Date(form.acquiredDate) : new Date();
    if (picker === 'expiry')   return form.expiryDate   ? new Date(form.expiryDate)   : new Date();
    return new Date();
  };

  const confirmPicker = (date: Date) => {
    const s = format(date, 'yyyy-MM-dd');
    if (picker === 'acquired') setForm(f => ({ ...f, acquiredDate: s }));
    if (picker === 'expiry')   setForm(f => ({ ...f, expiryDate: s }));
    setPicker(null);
  };

  const canSave = form.name.trim().length > 0 && form.acquiredDate.length > 0;

  const save = () => {
    if (!canSave) return;
    onSave({
      id: entry?.id ?? Date.now().toString(),
      ...form,
      name: form.name.trim(),
      expiryDate: hasExpiry ? form.expiryDate : '',
    });
  };

  const confirmDelete = () =>
    Alert.alert('자격증 삭제', '이 자격증을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: onDelete },
    ]);

  const { background: bg, card, border, primary, textMain, textSub } = colors;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={[fStyles.header, { borderBottomColor: border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[fStyles.navText, { color: textSub }]}>취소</Text>
            </TouchableOpacity>
            <Text style={[fStyles.headerTitle, { color: textMain }]}>{isNew ? '자격증 추가' : '자격증 수정'}</Text>
            <TouchableOpacity onPress={save} disabled={!canSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[fStyles.navText, { color: canSave ? primary : border }]}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={fStyles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* 종류 */}
            <Text style={[fStyles.label, { color: textSub }]}>종류</Text>
            <View style={fStyles.typeRow}>
              {(Object.keys(CERT_TYPE_LABELS) as CertType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    fStyles.typeChip,
                    { borderColor: form.type === t ? CERT_TYPE_COLORS[t] : border },
                    form.type === t && { backgroundColor: CERT_TYPE_COLORS[t] + '18' },
                  ]}
                  onPress={() => setForm(f => ({ ...f, type: t }))}
                >
                  <Text style={[fStyles.typeChipText, { color: form.type === t ? CERT_TYPE_COLORS[t] : textSub }]}>
                    {CERT_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 이름 */}
            <Text style={[fStyles.label, { color: textSub }]}>이름 *</Text>
            <TextInput
              style={[fStyles.input, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="예: TOEIC 850, 정보처리기사"
              placeholderTextColor={textSub}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />

            {/* 취득일 */}
            <Text style={[fStyles.label, { color: textSub }]}>취득일 *</Text>
            <TouchableOpacity
              style={[fStyles.datePicker, { backgroundColor: card, borderColor: form.acquiredDate ? primary : border }]}
              onPress={() => setPicker('acquired')}
            >
              <Ionicons name="calendar-outline" size={18} color={form.acquiredDate ? primary : textSub} />
              <Text style={[fStyles.dateText, { color: form.acquiredDate ? textMain : textSub }]}>
                {form.acquiredDate ? fmtDate(form.acquiredDate) : '취득일 선택'}
              </Text>
            </TouchableOpacity>

            {/* 만료일 */}
            <View style={[fStyles.switchRow, { borderColor: border }]}>
              <Text style={[fStyles.switchLabel, { color: textMain }]}>만료일 있음</Text>
              <Switch
                value={hasExpiry}
                onValueChange={setHasExpiry}
                trackColor={{ false: border, true: primary + '55' }}
                thumbColor={hasExpiry ? primary : textSub}
              />
            </View>
            {hasExpiry && (
              <TouchableOpacity
                style={[fStyles.datePicker, { backgroundColor: card, borderColor: form.expiryDate ? primary : border }]}
                onPress={() => setPicker('expiry')}
              >
                <Ionicons name="calendar-outline" size={18} color={form.expiryDate ? primary : textSub} />
                <Text style={[fStyles.dateText, { color: form.expiryDate ? textMain : textSub }]}>
                  {form.expiryDate ? fmtDate(form.expiryDate) : '만료일 선택'}
                </Text>
              </TouchableOpacity>
            )}

            {/* 발급기관 */}
            <Text style={[fStyles.label, { color: textSub }]}>발급기관</Text>
            <TextInput
              style={[fStyles.input, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="예: 한국산업인력공단"
              placeholderTextColor={textSub}
              value={form.issuer}
              onChangeText={v => setForm(f => ({ ...f, issuer: v }))}
            />

            {/* 메모 */}
            <Text style={[fStyles.label, { color: textSub }]}>메모</Text>
            <TextInput
              style={[fStyles.textarea, { backgroundColor: card, borderColor: border, color: textMain }]}
              placeholder="점수, 등급, 기타 메모"
              placeholderTextColor={textSub}
              value={form.memo}
              onChangeText={v => setForm(f => ({ ...f, memo: v }))}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            {!isNew && (
              <TouchableOpacity style={fStyles.deleteRow} onPress={confirmDelete}>
                <Text style={fStyles.deleteText}>이 자격증 삭제</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {picker !== null && (
          <DateTimePickerModal
            isVisible
            mode="date"
            date={pickerDate()}
            onConfirm={confirmPicker}
            onCancel={() => setPicker(null)}
            minimumDate={new Date(1970, 0, 1)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ── Summary item ──────────────────────────────────────────────────
function SummaryItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
  );
}

// ── CareerScreen ──────────────────────────────────────────────────
export default function CareerScreen() {
  const { colors, registerTourTarget } = useAppTheme();
  const [careers, setCareers] = useState<CareerEntry[]>([]);
  const [certs, setCerts] = useState<CertEntry[]>([]);
  const [careerModal, setCareerModal] = useState(false);
  const [certModal, setCertModal] = useState(false);
  const [selCareer, setSelCareer] = useState<CareerEntry | null>(null);
  const [selCert, setSelCert] = useState<CertEntry | null>(null);

  // Tour refs
  const careerSectionRef = useRef<View>(null);
  const careerAddBtnRef = useRef<View>(null);

  useEffect(() => {
    loadData();
    registerTourTarget('careerCompany', careerSectionRef as React.RefObject<View>);
    registerTourTarget('careerAdd', careerAddBtnRef as React.RefObject<View>);
  }, []);

  const loadData = async () => {
    const [cr, ce] = await Promise.all([
      AsyncStorage.getItem(CAREER_KEY),
      AsyncStorage.getItem(CERT_KEY),
    ]);
    if (cr) setCareers(JSON.parse(cr));
    if (ce) setCerts(JSON.parse(ce));
  };

  const persistCareers = async (data: CareerEntry[]) => {
    setCareers(data);
    await AsyncStorage.setItem(CAREER_KEY, JSON.stringify(data));
  };

  const persistCerts = async (data: CertEntry[]) => {
    setCerts(data);
    await AsyncStorage.setItem(CERT_KEY, JSON.stringify(data));
  };

  const saveCareer = async (entry: CareerEntry) => {
    const next = careers.some(c => c.id === entry.id)
      ? careers.map(c => c.id === entry.id ? entry : c)
      : [...careers, entry];
    await persistCareers(next);
    setCareerModal(false);
    setSelCareer(null);
  };

  const deleteCareer = async () => {
    if (!selCareer) return;
    await persistCareers(careers.filter(c => c.id !== selCareer.id));
    setCareerModal(false);
    setSelCareer(null);
  };

  const saveCert = async (entry: CertEntry) => {
    const next = certs.some(c => c.id === entry.id)
      ? certs.map(c => c.id === entry.id ? entry : c)
      : [...certs, entry];
    await persistCerts(next);
    setCertModal(false);
    setSelCert(null);
  };

  const deleteCert = async () => {
    if (!selCert) return;
    await persistCerts(certs.filter(c => c.id !== selCert.id));
    setCertModal(false);
    setSelCert(null);
  };

  // Sorted careers: current first, then by startDate desc
  const sortedCareers = [...careers].sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return b.startDate.localeCompare(a.startDate);
  });

  // Summary stats
  const totalDays = careers.reduce((s, c) => s + calcTenureDays(c.startDate, c.endDate, c.isCurrent), 0);
  const currentEntry = careers.find(c => c.isCurrent);
  const currentDays = currentEntry ? calcTenureDays(currentEntry.startDate, '', true) : 0;

  const { colors: c } = { colors };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: colors.textMain }]}>커리어</Text>

        {/* ── 요약 카드 ────────────────────────────────────────── */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SummaryItem label="총 경력" value={totalDays > 0 ? formatTenure(totalDays) : '-'} colors={colors} />
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <SummaryItem label="현재 근속" value={currentDays > 0 ? formatTenure(currentDays) : '-'} colors={colors} />
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <SummaryItem label="등록 회사" value={`${careers.length}곳`} colors={colors} />
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <SummaryItem label="자격증" value={`${certs.length}개`} colors={colors} />
        </View>

        {/* ── 경력 섹션 ────────────────────────────────────────── */}
        <View ref={careerSectionRef}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>경력</Text>
            <TouchableOpacity
              ref={careerAddBtnRef}
              style={[styles.sectionAddBtn, { backgroundColor: colors.primary }]}
              onPress={() => { setSelCareer(null); setCareerModal(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.sectionAddText}>추가</Text>
            </TouchableOpacity>
          </View>

          {sortedCareers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="briefcase-outline" size={30} color={colors.textSub} />
              <Text style={[styles.emptyText, { color: colors.textSub }]}>
                첫 번째 경력을 추가해보세요
              </Text>
            </View>
          ) : (
            sortedCareers.map(entry => {
              const days = calcTenureDays(entry.startDate, entry.endDate, entry.isCurrent);
              const accentColor = entry.isCurrent ? colors.primary : colors.textSub + '80';
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={[styles.careerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setSelCareer(entry); setCareerModal(true); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                  <View style={styles.careerBody}>
                    <View style={styles.careerTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.companyName, { color: colors.textMain }]}>{entry.companyName}</Text>
                        {!!entry.jobTitle && (
                          <Text style={[styles.jobTitle, { color: colors.primary }]}>{entry.jobTitle}</Text>
                        )}
                      </View>
                      {entry.isCurrent && (
                        <View style={[styles.currentBadge, { backgroundColor: colors.primary + '1A' }]}>
                          <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                          <Text style={[styles.currentBadgeText, { color: colors.primary }]}>재직중</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.periodRow}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSub} />
                      <Text style={[styles.periodText, { color: colors.textSub }]}>
                        {fmtDate(entry.startDate)} ~{' '}
                        {entry.isCurrent ? '재직중' : (entry.endDate ? fmtDate(entry.endDate) : '-')}
                      </Text>
                    </View>

                    <View style={[styles.tenureBadge, { backgroundColor: accentColor + '25' }]}>
                      <Text style={[styles.tenureText, { color: entry.isCurrent ? colors.primary : colors.textSub }]}>
                        근속 {formatTenure(days)} · D+{days}
                      </Text>
                    </View>

                    {!!entry.tasks && (
                      <Text style={[styles.previewLine, { color: colors.textSub }]} numberOfLines={1}>
                        📋 {entry.tasks}
                      </Text>
                    )}
                    {!!entry.achievements && (
                      <Text style={[styles.previewLine, { color: colors.textSub }]} numberOfLines={1}>
                        🏆 {entry.achievements}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.textSub} style={{ marginTop: 4 }} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── 자격증·어학 섹션 ──────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>자격증 · 어학</Text>
          <TouchableOpacity
            style={[styles.sectionAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setSelCert(null); setCertModal(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.sectionAddText}>추가</Text>
          </TouchableOpacity>
        </View>

        {certs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="ribbon-outline" size={30} color={colors.textSub} />
            <Text style={[styles.emptyText, { color: colors.textSub }]}>
              자격증이나 어학 성적을 추가해보세요
            </Text>
          </View>
        ) : (
          [...certs].sort((a, b) => b.acquiredDate.localeCompare(a.acquiredDate)).map(cert => (
            <TouchableOpacity
              key={cert.id}
              style={[styles.certCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { setSelCert(cert); setCertModal(true); }}
              activeOpacity={0.75}
            >
              <View style={[styles.certTypeBadge, { backgroundColor: CERT_TYPE_COLORS[cert.type] + '1E' }]}>
                <Text style={[styles.certTypeText, { color: CERT_TYPE_COLORS[cert.type] }]}>
                  {CERT_TYPE_LABELS[cert.type]}
                </Text>
              </View>
              <View style={styles.certBody}>
                <Text style={[styles.certName, { color: colors.textMain }]}>{cert.name}</Text>
                <Text style={[styles.certMeta, { color: colors.textSub }]}>
                  취득 {fmtDate(cert.acquiredDate)}
                  {cert.expiryDate ? ` · 만료 ${fmtDate(cert.expiryDate)}` : ''}
                </Text>
                {!!cert.issuer && (
                  <Text style={[styles.certMeta, { color: colors.textSub }]}>{cert.issuer}</Text>
                )}
                {!!cert.memo && (
                  <Text style={[styles.certMeta, { color: colors.textSub }]} numberOfLines={1}>{cert.memo}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.textSub} />
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      <CareerFormModal
        visible={careerModal}
        entry={selCareer}
        colors={colors}
        onSave={saveCareer}
        onDelete={deleteCareer}
        onClose={() => { setCareerModal(false); setSelCareer(null); }}
      />

      <CertFormModal
        visible={certModal}
        entry={selCert}
        colors={colors}
        onSave={saveCert}
        onDelete={deleteCert}
        onClose={() => { setCertModal(false); setSelCert(null); }}
      />
    </SafeAreaView>
  );
}

// ── Main Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },

  summaryCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 22, borderWidth: 1,
    paddingVertical: 18, paddingHorizontal: 12,
    marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '900', marginBottom: 3 },
  summaryLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  summaryDivider: { width: 1, height: 32, opacity: 0.3 },

  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12, marginTop: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionAddBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 12, gap: 3,
  },
  sectionAddText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  emptyCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 32, alignItems: 'center', gap: 10,
    marginBottom: 20,
  },
  emptyText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Career card
  careerCard: {
    flexDirection: 'row', borderRadius: 20, borderWidth: 1,
    overflow: 'hidden', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  accentBar: { width: 5 },
  careerBody: { flex: 1, padding: 16 },
  careerTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  companyName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  jobTitle: { fontSize: 13, fontWeight: '600' },
  currentBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  currentDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  currentBadgeText: { fontSize: 11, fontWeight: '800' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  periodText: { fontSize: 12, fontWeight: '600' },
  tenureBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, marginBottom: 8,
  },
  tenureText: { fontSize: 12, fontWeight: '800' },
  previewLine: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  // Cert card
  certCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, borderWidth: 1,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  certTypeBadge: {
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 10, marginRight: 12,
    alignSelf: 'flex-start',
  },
  certTypeText: { fontSize: 11, fontWeight: '800' },
  certBody: { flex: 1 },
  certName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  certMeta: { fontSize: 12, fontWeight: '500', marginTop: 1 },
});

// ── Form Styles ───────────────────────────────────────────────────
const fStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '800' },

  body: { padding: 20, paddingBottom: 60 },

  label: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 8, marginTop: 20,
  },
  input: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontWeight: '500',
  },
  textarea: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: '500',
    minHeight: 90,
  },
  datePicker: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  dateText: { fontSize: 15, fontWeight: '500' },

  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginTop: 20,
  },
  switchLabel: { fontSize: 15, fontWeight: '600' },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1.5,
  },
  typeChipText: { fontSize: 13, fontWeight: '700' },

  deleteRow: { marginTop: 36, alignItems: 'center', padding: 14 },
  deleteText: { color: '#FF3B30', fontSize: 15, fontWeight: '700' },
});
