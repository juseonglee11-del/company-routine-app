import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useAppTheme } from '../_layout';
import { JOB_CHARACTERS } from '@/constants/jobs';
import { JOIN_DATE_KEY } from '@/constants/jobs';
import { useState, useEffect } from 'react';

export default function CareerScreen() {
  const { colors, userProfile, selectedJob } = useAppTheme();
  const [joinDate, setJoinDate] = useState<Date | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(JOIN_DATE_KEY).then(val => {
      if (val) setJoinDate(new Date(val));
    });
  }, []);

  const currentChar = selectedJob && JOB_CHARACTERS[selectedJob]
    ? JOB_CHARACTERS[selectedJob]
    : null;

  const formatPeriod = (start: Date | null) => {
    if (!start) return '입사일 미등록';
    return `${format(start, 'yyyy.MM.dd')} ~ 재직 중`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: colors.textMain }]}>커리어</Text>
        <Text style={[styles.subtitle, { color: colors.textSub }]}>나의 경력을 한눈에 관리해보세요</Text>

        {/* 현재 재직 중 카드 */}
        <Text style={[styles.sectionLabel, { color: colors.textSub }]}>현재 회사</Text>
        {currentChar && userProfile ? (
          <View style={[styles.careerCard, { backgroundColor: colors.card, borderColor: currentChar.color + '40' }]}>
            <View style={[styles.careerCardAccent, { backgroundColor: currentChar.color }]} />
            <View style={styles.careerCardBody}>
              <View style={styles.careerCardHeader}>
                <View style={[styles.jobIconBg, { backgroundColor: currentChar.secondaryColor }]}>
                  <Text style={styles.jobEmoji}>{currentChar.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.companyName, { color: colors.textMain }]}>현재 회사</Text>
                  <Text style={[styles.jobTitle, { color: currentChar.color }]}>{currentChar.label}</Text>
                </View>
                <View style={[styles.activeBadge, { backgroundColor: currentChar.color + '20' }]}>
                  <View style={[styles.activeDot, { backgroundColor: currentChar.color }]} />
                  <Text style={[styles.activeBadgeText, { color: currentChar.color }]}>재직 중</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.periodRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSub} />
                <Text style={[styles.periodText, { color: colors.textSub }]}>
                  {formatPeriod(joinDate)}
                </Text>
              </View>
              {!joinDate && (
                <Text style={[styles.noDateHint, { color: colors.primary }]}>
                  홈 화면에서 입사일을 등록하면 자동으로 표시됩니다
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="briefcase-outline" size={32} color={colors.textSub} />
            <Text style={[styles.emptyText, { color: colors.textSub }]}>직종을 선택하면 현재 재직 정보가 표시됩니다</Text>
          </View>
        )}

        {/* 이전 경력 섹션 — 준비 중 */}
        <Text style={[styles.sectionLabel, { color: colors.textSub, marginTop: 28 }]}>이전 경력</Text>
        <View style={[styles.comingSoonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={28} color={colors.textSub} />
          <Text style={[styles.comingSoonTitle, { color: colors.textMain }]}>곧 추가될 기능이에요</Text>
          <Text style={[styles.comingSoonDesc, { color: colors.textSub }]}>
            이전 회사의 경력을 추가하고{'\n'}전체 커리어를 한눈에 관리할 수 있어요
          </Text>

          {/* 미리보기 예시 카드 */}
          <View style={[styles.previewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSub }]}>회사명</Text>
              <Text style={[styles.previewValue, { color: colors.textMain }]}>이전 회사명</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSub }]}>직무</Text>
              <Text style={[styles.previewValue, { color: colors.textMain }]}>품질관리(PQC)</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSub }]}>기간</Text>
              <Text style={[styles.previewValue, { color: colors.textMain }]}>2022.10 ~ 2024.03</Text>
            </View>
          </View>
        </View>

        {/* 추가 버튼 — 비활성 */}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.border }]}
          activeOpacity={0.7}
          disabled
        >
          <Ionicons name="add" size={20} color={colors.textSub} />
          <Text style={[styles.addBtnText, { color: colors.textSub }]}>경력 추가하기 (준비 중)</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },

  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 13, fontWeight: '500', marginBottom: 28 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 12,
  },

  // 재직 중 카드
  careerCard: {
    borderRadius: 22, borderWidth: 1.5, overflow: 'hidden',
    flexDirection: 'row', marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  careerCardAccent: { width: 5 },
  careerCardBody: { flex: 1, padding: 18 },
  careerCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  jobIconBg: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  jobEmoji: { fontSize: 24 },
  companyName: { fontSize: 16, fontWeight: '800' },
  jobTitle: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  activeDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  activeBadgeText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, opacity: 0.25, marginBottom: 12 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodText: { fontSize: 13, fontWeight: '600' },
  noDateHint: { fontSize: 11, fontWeight: '600', marginTop: 8 },

  // 빈 상태
  emptyCard: {
    borderRadius: 20, borderWidth: 1, padding: 28,
    alignItems: 'center', gap: 12,
  },
  emptyText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // 준비 중 카드
  comingSoonCard: {
    borderRadius: 22, borderWidth: 1.5, padding: 24,
    alignItems: 'center', gap: 8,
  },
  comingSoonTitle: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  comingSoonDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 20 },

  // 미리보기 예시
  previewCard: {
    width: '100%', borderRadius: 14, borderWidth: 1, padding: 14,
    marginTop: 12, gap: 8,
  },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { fontSize: 12, fontWeight: '600' },
  previewValue: { fontSize: 12, fontWeight: '700' },

  // 추가 버튼
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 18, marginTop: 20, gap: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },
});
