import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/app/_layout';

export const TOUR_SEEN_KEY = '@tour_seen';

// Tab index in (tabs)/_layout: 홈(index=0), 커리어(1), 루틴(2), 통계(3), 설정(4)
export const TOUR_STEPS = [
  {
    key: 'joinDate',
    title: '입사일 등록하기',
    emoji: '📅',
    desc: '입사일을 등록하면 근속일과 D+일수를\n자동으로 계산해드려요.',
    tab: 'index',
  },
  {
    key: 'checklist',
    title: '오늘의 체크리스트',
    emoji: '📝',
    desc: '매일 루틴을 완료하고 체크하세요.\n작은 습관이 큰 변화를 만듭니다.',
    tab: 'index',
  },
  {
    key: 'themeButton',
    title: '테마 변경',
    emoji: '🎨',
    desc: '원하는 색상으로 화면을 꾸며보세요 🎨\nWhite, Dark, Pink, Blue, Green,\nYellow 테마를 선택할 수 있어요.',
    tab: 'index',
  },
  {
    key: 'careerCompany',
    title: '경력 카드',
    emoji: '💼',
    desc: '현재 회사와 이전 경력을 카드로 확인해요.\n근속일이 자동으로 계산되고,\n카드를 눌러 수정·삭제할 수 있어요.',
    tab: 'career',
  },
  {
    key: 'careerAdd',
    title: '경력 · 자격증 추가',
    emoji: '➕',
    desc: '+ 추가 버튼으로 경력이나\n자격증·어학 성적을 등록할 수 있어요.\n회사명, 직무, 기간, 주요 성과를 기록해보세요.',
    tab: 'career',
  },
  {
    key: 'routineCalendar',
    title: '루틴 달력',
    emoji: '📆',
    desc: '루틴을 완료한 날에는 점이 표시돼요.\n꾸준함을 달력으로 한눈에 확인하세요!',
    tab: 'routine',
  },
  {
    key: 'routineDateRecord',
    title: '날짜별 기록 확인',
    emoji: '✅',
    desc: '날짜를 선택하면 그 날의 루틴 완료 기록과\n달성률을 함께 확인할 수 있어요.',
    tab: 'routine',
  },
  {
    key: 'routineAdd',
    title: '루틴 추가',
    emoji: '✏️',
    desc: '원하는 루틴을 입력하고\n+ 버튼을 눌러 바로 추가해보세요.',
    tab: 'routine',
  },
  {
    key: 'statsAchievement',
    title: '이번 달 요약',
    emoji: '📊',
    desc: '평균 달성률, 완료한 루틴 수,\n연속 달성일, 가장 많이 완료한 루틴을\n한눈에 확인할 수 있어요.',
    tab: 'stats',
  },
  {
    key: 'statsSummary',
    title: '달성률 추이 · 루틴별 달성도',
    emoji: '📈',
    desc: '날짜별 달성률 변화를 차트로 확인하고\n루틴별 완료율도 막대그래프로\n비교해볼 수 있어요.',
    tab: 'stats',
  },
] as const;

export const TOUR_STEP_COUNT = TOUR_STEPS.length; // 9
// TOUR_STEP_COUNT is the "completion" step index

const TAB_ROUTES: Record<string, string> = {
  index: '/(tabs)',
  career: '/(tabs)/career',
  routine: '/(tabs)/routine',
  stats: '/(tabs)/stats',
};

const PAD = 10;
const DIM = 'rgba(0,0,0,0.74)';

type Spotlight = { x: number; y: number; w: number; h: number };

export default function TourOverlay() {
  const { colors, tourStep, nextTourStep, prevTourStep, endTour, getTourRef } = useAppTheme();
  const router = useRouter();
  const { width: screenW, height: screenH } = Dimensions.get('window');
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const prevTabRef = useRef<string>('index');

  const isCompletion = tourStep === TOUR_STEP_COUNT;
  const step = !isCompletion && tourStep >= 0 ? TOUR_STEPS[tourStep as number] : null;

  useEffect(() => {
    if (tourStep < 0) {
      setSpotlight(null);
      prevTabRef.current = 'index';
      return;
    }

    // Completion step — navigate home and show congrats card
    if (tourStep >= TOUR_STEP_COUNT) {
      setSpotlight(null);
      router.navigate(TAB_ROUTES['index'] as any);
      return;
    }

    const cur = TOUR_STEPS[tourStep as number];
    const tabChanged = prevTabRef.current !== cur.tab;
    prevTabRef.current = cur.tab;

    if (tabChanged) {
      router.navigate(TAB_ROUTES[cur.tab] as any);
    }

    setSpotlight(null);
    const delay = tabChanged ? 650 : 160;
    const timer = setTimeout(() => {
      getTourRef(cur.key)?.current?.measure(
        (_x: number, _y: number, w: number, h: number, px: number, py: number) => {
          if (w > 0 && h > 0) setSpotlight({ x: px, y: py, w, h });
        }
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [tourStep]);

  if (tourStep < 0) return null;

  // ── Completion screen ───────────────────────────────────────────
  if (isCompletion) {
    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
        <View style={styles.completionBg}>
          <View style={[styles.completionCard, { backgroundColor: colors.card }]}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={[styles.completionTitle, { color: colors.textMain }]}>준비 완료!</Text>
            <Text style={[styles.completionSub, { color: colors.textSub }]}>
              오늘도 나답게 한 걸음씩 🚀
            </Text>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
              onPress={endTour}
            >
              <Text style={styles.startBtnText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!step) return null;

  // ── Spotlight layout ────────────────────────────────────────────
  const sx = spotlight ? Math.max(0, spotlight.x - PAD) : 0;
  const sy = spotlight ? Math.max(0, spotlight.y - PAD) : 0;
  const sw = spotlight ? Math.min(screenW - sx, spotlight.w + PAD * 2) : 0;
  const sh = spotlight ? Math.min(screenH - sy, spotlight.h + PAD * 2) : 0;

  // Position tooltip above spotlight if it falls in the lower half
  const above = spotlight !== null && sy + sh > screenH * 0.55;
  const tooltipStyle = above
    ? { bottom: screenH - sy + 14 }
    : { top: spotlight ? sy + sh + 14 : screenH * 0.45 };

  const isLast = tourStep === TOUR_STEP_COUNT - 1;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={endTour}>
      {/* 4-rectangle dim layer */}
      {spotlight ? (
        <>
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: sy }]} />
          <View style={[styles.dim, { top: sy, left: 0, width: sx, height: sh }]} />
          <View style={[styles.dim, { top: sy, left: sx + sw, right: 0, height: sh }]} />
          <View style={[styles.dim, { top: sy + sh, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.highlight, { top: sy, left: sx, width: sw, height: sh }]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />
      )}

      {/* Tooltip card */}
      <View style={[styles.tooltip, { backgroundColor: colors.card }, tooltipStyle]}>
        {/* Header */}
        <View style={styles.row}>
          <Text style={styles.stepEmoji}>{step.emoji}</Text>
          <Text style={[styles.stepTitle, { color: colors.textMain }]}>{step.title}</Text>
          <TouchableOpacity onPress={endTour} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.skipText, { color: colors.textSub }]}>건너뛰기</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.stepDesc, { color: colors.textSub }]}>{step.desc}</Text>

        {/* Progress dots + nav buttons */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {TOUR_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === tourStep ? colors.primary : colors.border },
                  i === tourStep && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.navRow}>
            {(tourStep as number) > 0 && (
              <TouchableOpacity
                style={[styles.prevBtn, { borderColor: colors.border }]}
                onPress={prevTourStep}
              >
                <Text style={[styles.prevBtnText, { color: colors.textMain }]}>이전</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={nextTourStep}
            >
              <Text style={styles.nextBtnText}>{isLast ? '완료' : '다음'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: DIM },

  highlight: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 5,
  },

  tooltip: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepEmoji: { fontSize: 22, marginRight: 8 },
  stepTitle: { flex: 1, fontSize: 17, fontWeight: '800' },
  skipText: { fontSize: 13, fontWeight: '600' },
  stepDesc: { fontSize: 14, lineHeight: 22, fontWeight: '500', marginBottom: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  dotActive: { width: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prevBtn: {
    height: 42, paddingHorizontal: 16,
    borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  prevBtnText: { fontSize: 14, fontWeight: '700' },
  nextBtn: {
    height: 42, paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Completion
  completionBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionCard: {
    width: '84%',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  completionEmoji: { fontSize: 64, marginBottom: 18 },
  completionTitle: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  completionSub: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  startBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
