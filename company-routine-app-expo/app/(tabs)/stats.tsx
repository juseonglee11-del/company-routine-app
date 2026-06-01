import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useAppTheme } from '../_layout';
import { JOIN_DATE_KEY } from '@/constants/jobs';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { colors, completionData, isLoaded: contextLoaded } = useAppTheme();
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  useEffect(() => {
    loadJoinDate();
  }, []);

  const loadJoinDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(JOIN_DATE_KEY);
      if (savedDate) setJoinDate(new Date(savedDate));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocalLoaded(true);
    }
  };

  const stats = useMemo(() => {
    if (!contextLoaded || !isLocalLoaded) return null;

    const today = new Date();
    const totalCareerDays = joinDate ? differenceInDays(today, joinDate) + 1 : 0;
    
    // This Month Stats
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let completedDaysInMonth = 0;
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      if (completionData[dateStr] && completionData[dateStr].length > 0) {
        completedDaysInMonth++;
      }
    });

    // Overall Routine Stats
    const totalDaysRecorded = Object.keys(completionData).filter(d => completionData[d].length > 0).length;
    const totalCompletions = Object.values(completionData).reduce((acc, val) => acc + val.length, 0);

    return {
      totalCareerDays,
      completedDaysInMonth,
      totalDaysRecorded,
      totalCompletions,
      monthProgress: (completedDaysInMonth / daysInMonth.length) * 100,
    };
  }, [contextLoaded, isLocalLoaded, joinDate, completionData]);

  if (!contextLoaded || !isLocalLoaded) return null;

  const hasData = stats && (stats.totalDaysRecorded > 0 || stats.totalCareerDays > 0);

  if (!hasData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={80} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.textMain }]}>아직 기록이 없어요</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSub }]}>
            루틴을 완료하면 여기서 성장 기록을 확인할 수 있어요 🌱
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.title, { color: colors.textMain }]}>나의 성장 통계 📊</Text>

        {/* Career Summary */}
        <View style={styles.row}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSub }]}>총 경력일</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.totalCareerDays}일</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSub }]}>이번 달 달성일</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats?.completedDaysInMonth}일</Text>
          </View>
        </View>

        {/* Monthly Achievement */}
        <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>이번 달 루틴 달성도</Text>
            <Text style={[styles.cardValue, { color: colors.primary }]}>{Math.round(stats?.monthProgress || 0)}%</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border + '50' }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${stats?.monthProgress}%` }]} />
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSub }]}>
            이번 달은 총 {stats?.completedDaysInMonth}일 동안 루틴을 실천하셨습니다.
          </Text>
        </View>

        {/* Activity Summary */}
        <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textMain, marginBottom: 20 }]}>활동 요약</Text>
          
          <View style={styles.activityItem}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityLabel, { color: colors.textSub }]}>누적 루틴 완료 수</Text>
              <Text style={[styles.activityValue, { color: colors.textMain }]}>{stats?.totalCompletions}개</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.iconBox, { backgroundColor: '#10B98115' }]}>
              <Ionicons name="calendar" size={20} color="#10B981" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityLabel, { color: colors.textSub }]}>기록된 총 일수</Text>
              <Text style={[styles.activityValue, { color: colors.textMain }]}>{stats?.totalDaysRecorded}일</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightBox}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={[styles.insightText, { color: colors.textSub }]}>
            꾸준함이 최고의 재능입니다. {stats?.totalDaysRecorded || 0}일 동안 쌓아온 당신의 기록이 증명하고 있어요!
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: (width - 50) / 2, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900' },
  bigCard: { padding: 24, borderRadius: 28, borderWidth: 1, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardValue: { fontSize: 18, fontWeight: '900' },
  progressBg: { height: 12, borderRadius: 6, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  cardDesc: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  activityValue: { fontSize: 18, fontWeight: '800' },
  insightBox: { flexDirection: 'row', padding: 20, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.05)', alignItems: 'center' },
  insightText: { flex: 1, marginLeft: 15, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
