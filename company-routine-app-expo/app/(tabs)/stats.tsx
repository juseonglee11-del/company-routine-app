import React, { useState, useEffect, useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { useAppTheme, isRoutineActiveOnDate } from '../_layout';
import { JOIN_DATE_KEY } from '@/constants/jobs';
import { TOUR_STEPS, TOUR_STEP_COUNT } from '@/components/TourOverlay';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────
type DayStat    = { label: string; isToday: boolean; rate: number | null };
type RoutineStat = { id: string; task: string; completedDays: number; activeDays: number; rate: number };

// ── Mock data for tutorial ────────────────────────────────────────
const MOCK_RECENT_7: DayStat[] = [
  { label: '6/1',  isToday: false, rate: 80   },
  { label: '6/2',  isToday: false, rate: null  },
  { label: '6/3',  isToday: false, rate: 100  },
  { label: '6/4',  isToday: false, rate: 75   },
  { label: '6/5',  isToday: false, rate: 60   },
  { label: '6/6',  isToday: false, rate: null  },
  { label: '오늘', isToday: true,  rate: 40   },
];

const MOCK_ROUTINE_STATS: RoutineStat[] = [
  { id: 'm1', task: '🏃 운동 30분',       rate: 57, completedDays: 17, activeDays: 30 },
  { id: 'm2', task: '📚 영어 공부 10분',  rate: 47, completedDays: 14, activeDays: 30 },
  { id: 'm3', task: '💧 물 2L 마시기',    rate: 60, completedDays: 18, activeDays: 30 },
  { id: 'm4', task: '😴 7시간 이상 수면', rate: 43, completedDays: 13, activeDays: 30 },
];

const MOCK = {
  monthAvg:         55,
  monthCompletions: 62,
  streak:           5,
  topTaskName:      '💧 물 2L 마시기',
  recentDays:       MOCK_RECENT_7,
  routineStats:     MOCK_ROUTINE_STATS,
};

// ── Helpers ───────────────────────────────────────────────────────
const calcStreak = (completionData: { [k: string]: number[] }): number => {
  let streak = 0;
  const cur = new Date();
  while (true) {
    const s = format(cur, 'yyyy-MM-dd');
    if ((completionData[s]?.length ?? 0) > 0) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
};

// ── RecentDaysChart ───────────────────────────────────────────────
function RecentDaysChart({ days, colors }: { days: DayStat[]; colors: any }) {
  return (
    <View style={{ gap: 14 }}>
      {days.map((d, i) => (
        <View key={i} style={recentStyles.row}>
          {/* Date label */}
          <Text
            style={[
              recentStyles.label,
              { color: d.isToday ? colors.primary : colors.textSub,
                fontWeight: d.isToday ? '800' : '600' },
            ]}
          >
            {d.label}
          </Text>

          {d.rate === null ? (
            /* No data */
            <Text style={[recentStyles.noData, { color: colors.textSub + '70' }]}>기록 없음</Text>
          ) : (
            /* Progress bar + pct */
            <>
              <View style={[recentStyles.track, { backgroundColor: colors.border + '60' }]}>
                <View
                  style={[
                    recentStyles.fill,
                    {
                      width: `${d.rate}%` as any,
                      backgroundColor: d.isToday ? colors.primary : colors.primary + 'BB',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  recentStyles.pct,
                  { color: d.isToday ? colors.primary : colors.textMain },
                ]}
              >
                {d.rate}%
              </Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

// ── RoutineBar ────────────────────────────────────────────────────
function RoutineBar({ task, rate, completedDays, activeDays, colors }:
  RoutineStat & { colors: any }) {
  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text style={[barStyles.task, { color: colors.textMain }]} numberOfLines={1}>{task}</Text>
        <Text style={[barStyles.pct,  { color: colors.primary  }]}>{rate}%</Text>
      </View>
      <View style={[barStyles.track, { backgroundColor: colors.border + '60' }]}>
        <View
          style={[barStyles.fill, {
            width: `${Math.min(100, rate)}%` as any,
            backgroundColor: colors.primary,
          }]}
        />
      </View>
      <Text style={[barStyles.sub, { color: colors.textSub }]}>
        {completedDays}회 완료 / {activeDays}회 예정
      </Text>
    </View>
  );
}

// ── SummaryCard ───────────────────────────────────────────────────
function SummaryCard({ icon, label, value, accent, small, colors }: {
  icon: any; label: string; value: string;
  accent?: string; small?: boolean; colors: any;
}) {
  const color = accent ?? colors.primary;
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.summaryIconBox, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text
        style={[small ? styles.summaryValueSm : styles.summaryValue, { color: colors.textMain }]}
        numberOfLines={small ? 2 : 1}
        adjustsFontSizeToFit={!small}
      >
        {value}
      </Text>
      <Text style={[styles.summaryLabel, { color: colors.textSub }]}>{label}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────
export default function StatsScreen() {
  const {
    colors, completionData, routines,
    isLoaded: contextLoaded, registerTourTarget, tourStep,
  } = useAppTheme();
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const statsAchievementRef = React.useRef<View>(null);
  const statsSummaryRef     = React.useRef<View>(null);

  useEffect(() => {
    AsyncStorage.getItem(JOIN_DATE_KEY).finally(() => setIsLocalLoaded(true));
    registerTourTarget('statsAchievement', statsAchievementRef as React.RefObject<View>);
    registerTourTarget('statsSummary',     statsSummaryRef     as React.RefObject<View>);
  }, []);

  const computed = useMemo(() => {
    if (!contextLoaded || !isLocalLoaded) return null;

    const today     = new Date();
    const todayStr  = format(today, 'yyyy-MM-dd');
    // 이번 달 전체 날짜
    const monthDays = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
    // 오늘까지의 날짜 (미래 제외)
    const pastDays  = monthDays.filter(d => format(d, 'yyyy-MM-dd') <= todayStr);

    // ── 계획별 달성도 ──────────────────────────────────────────
    // taskActiveDays  : 이번 달 전체(미래 포함)에 해당 계획이 등록된 날짜 집합
    // taskCompletedSet: 오늘까지 완료 체크한 날짜 집합 (Set로 중복 방지)
    const taskActiveDays   = new Map<string, Set<string>>();
    const taskCompletedSet = new Map<string, Set<string>>();

    for (const r of routines) {
      for (const day of monthDays) {
        const ds = format(day, 'yyyy-MM-dd');
        if (!isRoutineActiveOnDate(r, ds)) continue;

        // 초기화
        if (!taskActiveDays.has(r.task)) {
          taskActiveDays.set(r.task, new Set());
          taskCompletedSet.set(r.task, new Set());
        }

        // 예정: 이번 달 전체 포함
        taskActiveDays.get(r.task)!.add(ds);

        // 완료: 오늘까지만
        if (ds <= todayStr && completionData[ds]?.includes(r.id)) {
          taskCompletedSet.get(r.task)!.add(ds);
        }
      }
    }

    const routineStats: RoutineStat[] = Array.from(taskActiveDays.entries())
      .map(([task, activeSet]) => {
        const activeDays    = activeSet.size;
        const completedDays = taskCompletedSet.get(task)?.size ?? 0;
        return {
          id: task,
          task,
          completedDays,
          activeDays,
          rate: Math.round((completedDays / activeDays) * 100),
        };
      });
    // activeDays가 0인 계획은 없으므로 filter 불필요 (loop에서 활성 날 없으면 Map에 안 들어감)

    // ── 최근 7일 달성률 ────────────────────────────────────────
    const recentDays: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d       = new Date(today);
      d.setDate(d.getDate() - i);
      const ds      = format(d, 'yyyy-MM-dd');
      const isToday = i === 0;
      const label   = isToday ? '오늘' : `${d.getMonth() + 1}/${d.getDate()}`;

      const active = routines.filter(r => isRoutineActiveOnDate(r, ds));
      if (active.length === 0) {
        recentDays.push({ label, isToday, rate: null });
      } else {
        const done = (completionData[ds] ?? []).filter(id => active.some(r => r.id === id)).length;
        recentDays.push({ label, isToday, rate: Math.round((done / active.length) * 100) });
      }
    }

    // ── 요약 지표 ──────────────────────────────────────────────
    // monthAvg: 오늘까지 계획이 있는 날의 실제 달성률 평균
    let totalActive = 0, totalDone = 0;
    for (const day of pastDays) {
      const ds     = format(day, 'yyyy-MM-dd');
      const active = routines.filter(r => isRoutineActiveOnDate(r, ds));
      if (active.length === 0) continue;
      totalActive += active.length;
      totalDone   += (completionData[ds] ?? []).filter(id => active.some(r => r.id === id)).length;
    }
    const monthAvg = totalActive > 0 ? Math.round((totalDone / totalActive) * 100) : 0;

    const monthCompletions = pastDays.reduce((s, day) => {
      return s + (completionData[format(day, 'yyyy-MM-dd')]?.length ?? 0);
    }, 0);

    const streak = calcStreak(completionData);

    // 가장 많이 완료한 계획 (이번 달 기준)
    const topEntry    = [...taskCompletedSet.entries()]
      .sort((a, b) => b[1].size - a[1].size)
      .find(([, s]) => s.size > 0);
    const topTaskName = topEntry?.[0] ?? null;

    const hasData = routineStats.length > 0;

    return { monthAvg, monthCompletions, streak, topTaskName, recentDays, routineStats, hasData };
  }, [contextLoaded, isLocalLoaded, completionData, routines]);

  const isStatsTour = tourStep >= 0 && tourStep < TOUR_STEP_COUNT
    && TOUR_STEPS[tourStep as number]?.tab === 'stats';
  const d = isStatsTour ? MOCK : computed;

  if (!contextLoaded || !isLocalLoaded) return null;

  if (!isStatsTour && !computed?.hasData) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={72} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.textMain }]}>아직 기록이 없어요</Text>
          <Text style={[styles.emptyDesc,  { color: colors.textSub  }]}>
            계획을 완료하면 통계가 생성됩니다 📈
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!d) return null;

  const topName = (d as any).topTaskName ?? '-';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: colors.textMain }]}>나의 성장 통계 📊</Text>

        {isStatsTour && (
          <View style={[styles.mockBanner, {
            backgroundColor: colors.primary + '14',
            borderColor:     colors.primary + '35',
          }]}>
            <Ionicons name="sparkles-outline" size={13} color={colors.primary} />
            <Text style={[styles.mockBannerText, { color: colors.primary }]}>
              튜토리얼 예시 화면입니다 · 실제 데이터와 다릅니다
            </Text>
          </View>
        )}

        {/* ── 상단 요약 카드 4개 ──────────────────────────────── */}
        <View ref={statsAchievementRef} style={styles.grid}>
          <SummaryCard icon="trending-up"    label="이번 달 평균 달성률" value={`${d.monthAvg}%`}          colors={colors} />
          <SummaryCard icon="checkmark-done" label="이번 달 완료한 계획" value={`${d.monthCompletions}개`} colors={colors} />
          <SummaryCard icon="flame"          label="연속 달성일"         value={`${d.streak}일`}           accent="#F59E0B" colors={colors} />
          <SummaryCard icon="star"           label="가장 많이 완료"      value={topName}                   small colors={colors} />
        </View>

        {/* ── 최근 7일 달성률 ─────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textMain }]}>최근 7일 달성률</Text>
          <Text style={[styles.cardSub,   { color: colors.textSub  }]}>날짜별 완료 계획 비율</Text>
          <RecentDaysChart days={d.recentDays as DayStat[]} colors={colors} />
        </View>

        {/* ── 계획별 달성도 ───────────────────────────────────── */}
        <View ref={statsSummaryRef} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textMain }]}>계획별 달성도</Text>
          <Text style={[styles.cardSub,   { color: colors.textSub  }]}>이번 달 전체 기준</Text>

          {d.routineStats.length === 0 ? (
            <Text style={[styles.noRoutine, { color: colors.textSub }]}>등록된 계획이 없습니다</Text>
          ) : (
            [...d.routineStats]
              .sort((a, b) => b.rate - a.rate)
              .map(r => <RoutineBar key={r.id} {...r} colors={colors} />)
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140 },
  title:  { fontSize: 24, fontWeight: '800', marginBottom: 16 },

  mockBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7, marginBottom: 16,
  },
  mockBannerText: { fontSize: 12, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: {
    width: (SCREEN_W - 52) / 2,
    borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  summaryIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  summaryValue:   { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  summaryValueSm: { fontSize: 13, fontWeight: '800', marginBottom: 4, lineHeight: 18 },
  summaryLabel:   { fontSize: 11, fontWeight: '600' },

  card: {
    borderRadius: 22, borderWidth: 1, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardSub:   { fontSize: 12, fontWeight: '500', marginBottom: 16 },
  noRoutine: { fontSize: 13, fontWeight: '500', textAlign: 'center', paddingVertical: 12 },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  emptyDesc:  { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

const recentStyles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center' },
  label:  { width: 40, fontSize: 12 },
  noData: { fontSize: 12, fontWeight: '500' },
  track:  { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
  fill:   { height: '100%', borderRadius: 4 },
  pct:    { width: 38, textAlign: 'right', fontSize: 12, fontWeight: '800' },
});

const barStyles = StyleSheet.create({
  row:      { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  task:     { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  pct:      { fontSize: 13, fontWeight: '800' },
  track:    { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  fill:     { height: '100%', borderRadius: 5 },
  sub:      { fontSize: 11, fontWeight: '500' },
});
