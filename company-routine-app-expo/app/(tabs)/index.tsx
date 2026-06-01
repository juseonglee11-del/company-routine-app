import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, differenceInYears } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../_layout';
import { JOB_CHARACTERS, JOIN_DATE_KEY, JobType } from '@/constants/jobs';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    theme,
    toggleTheme,
    colors,
    selectedJob,
    updateJob,
    routines,
    completionData,
    toggleRoutineCompletion,
    isLoaded,
  } = useAppTheme();
  const router = useRouter();
  const [joinDate, setJoinDate] = useState(new Date(2024, 0, 1));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!selectedJob || !JOB_CHARACTERS[selectedJob]) {
      router.replace('/onboarding');
    } else {
      loadJoinDate();
    }
  }, [selectedJob, isLoaded]);

  const loadJoinDate = async () => {
    const saved = await AsyncStorage.getItem(JOIN_DATE_KEY);
    if (saved) setJoinDate(new Date(saved));
  };

  const handleConfirmDate = async (date: Date) => {
    setJoinDate(date);
    setDatePickerVisibility(false);
    await AsyncStorage.setItem(JOIN_DATE_KEY, date.toISOString());
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompletedCount = (completionData[todayStr] || []).length;
  const totalRoutinesCount = routines.length;
  const todayProgress = totalRoutinesCount > 0 ? (todayCompletedCount / totalRoutinesCount) * 100 : 0;

  if (!isLoaded || !selectedJob || !JOB_CHARACTERS[selectedJob]) return null;

  const currentChar = JOB_CHARACTERS[selectedJob];
  const today = new Date();
  const daysElapsed = differenceInDays(today, joinDate) + 1;
  const yearsOfService = differenceInYears(today, joinDate);
  const months = Math.floor(daysElapsed / 30) % 12;
  const totalTenure = yearsOfService > 0 ? `${yearsOfService}년 ${months}개월` : `${Math.floor(daysElapsed / 30)}개월`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 10 : 0 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSub }]}>오늘도 차곡차곡 쌓아보자 🚀</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textMain }]}>차곡차곡</Text>
              <TouchableOpacity
                onPress={() => setIsJobModalVisible(true)}
                style={[styles.characterMiniBtn, { backgroundColor: currentChar.secondaryColor }]}
              >
                <Text style={styles.characterMiniEmoji}>{currentChar.emoji}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons
                name={theme === 'dark' ? 'moon' : theme === 'pink' ? 'color-palette' : 'sunny'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. 입사일 카드 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
          onPress={() => setDatePickerVisibility(true)}
          activeOpacity={0.9}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, { color: colors.textSub }]}>입사일 (터치하여 변경)</Text>
              <Text style={[styles.cardValue, { color: colors.textMain }]}>{format(joinDate, 'yyyy.MM.dd')}</Text>
              <View style={styles.tenureContainer}>
                <View style={[styles.badge, { backgroundColor: currentChar.color + '22' }]}>
                  <Text style={[styles.badgeText, { color: currentChar.color }]}>D + {daysElapsed}</Text>
                </View>
                <Text style={[styles.tenureText, { color: colors.textSub }]}>{yearsOfService}년차</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.cardLabel, { color: colors.textSub, marginTop: 10 }]}>현재 회사 근속</Text>
              <Text style={[styles.careerValue, { color: colors.textMain }]}>{totalTenure}</Text>
            </View>

            {/* 직종 캐릭터 — 터치 시 직종 변경 모달 */}
            <TouchableOpacity
              onPress={() => setIsJobModalVisible(true)}
              style={[styles.characterCard, { backgroundColor: currentChar.secondaryColor, borderColor: currentChar.color + '40' }]}
              activeOpacity={0.85}
            >
              <View style={styles.characterCircle}>
                <Text style={styles.characterEmoji}>{currentChar.emoji}</Text>
              </View>
              <View style={[styles.jobBadge, { backgroundColor: currentChar.color }]}>
                <Text style={styles.jobBadgeText}>{currentChar.label}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* 2. 오늘의 체크리스트 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>오늘의 체크리스트 📝</Text>
            <Text style={[styles.countBadge, { color: colors.primary }]}>
              {todayCompletedCount}/{totalRoutinesCount}
            </Text>
          </View>
          <View style={[styles.routineListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {routines.length > 0 ? (
              routines.map((item) => {
                const isCompleted = (completionData[todayStr] || []).includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.routineRow}
                    onPress={() => toggleRoutineCompletion(todayStr, item.id)}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={isCompleted ? colors.primary : colors.textSub}
                    />
                    <Text
                      style={[
                        styles.routineText,
                        { color: colors.textMain },
                        isCompleted && { textDecorationLine: 'line-through', color: colors.textSub },
                      ]}
                    >
                      {item.task}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={[styles.emptyRoutine, { color: colors.textSub }]}>
                루틴 탭에서 루틴을 추가해보세요 ✏️
              </Text>
            )}
          </View>
        </View>

        {/* 3. 오늘의 달성률 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>오늘의 달성률 📈</Text>
              <Text style={[styles.achievementHint, { color: colors.textSub }]}>
                {todayProgress === 100
                  ? '오늘 목표를 모두 달성했어요! 🎉'
                  : '오늘도 한 걸음씩 성장해보세요 💪'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.percentText, { color: colors.primary }]}>{Math.round(todayProgress)}%</Text>
              <Text style={[styles.countText, { color: colors.textSub }]}>
                {todayCompletedCount} / {totalRoutinesCount} 완료
              </Text>
            </View>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border + '80' }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${todayProgress}%` as any },
              ]}
            />
          </View>
        </View>

        {/* 4. 응원 카드 */}
        <View style={[styles.encouragementCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.encouragementEmoji}>🌱</Text>
          <View style={styles.encouragementBody}>
            <Text style={[styles.encouragementLabel, { color: colors.textSub }]}>오늘의 응원</Text>
            <Text style={[styles.encouragementText, { color: colors.textMain }]}>
              작은 습관이 큰 변화를 만든다
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* DateTimePicker — ScrollView 밖에 조건부 렌더링 (New Architecture 호환) */}
      {isDatePickerVisible && (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          date={joinDate}
        />
      )}

      {/* 직종 선택 모달 — ScrollView 밖 */}
      <Modal visible={isJobModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>직종 변경</Text>
              <TouchableOpacity onPress={() => setIsJobModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.jobGrid} showsVerticalScrollIndicator={false}>
              {(Object.keys(JOB_CHARACTERS) as JobType[]).map((key) => {
                const item = JOB_CHARACTERS[key];
                const isSelected = selectedJob === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      updateJob(key);
                      setIsJobModalVisible(false);
                    }}
                    activeOpacity={0.85}
                    style={[
                      styles.jobItem,
                      {
                        backgroundColor: isSelected ? item.secondaryColor : colors.background,
                        borderColor: isSelected ? item.color : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.jobIconCircle, { backgroundColor: isSelected ? '#fff' : item.secondaryColor }]}>
                      <Text style={styles.jobModalEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={[styles.jobModalLabel, { color: isSelected ? item.color : colors.textMain }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  title: { fontSize: 22, fontWeight: '800' },
  characterMiniBtn: {
    marginLeft: 10, width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  characterMiniEmoji: { fontSize: 20 },
  headerActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 14, padding: 5 },

  // 입사일 카드
  card: {
    borderRadius: 28, padding: 20, borderWidth: 1,
    elevation: 8, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 16, marginBottom: 28,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 21, fontWeight: '800', marginBottom: 12 },
  tenureContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginRight: 10 },
  badgeText: { fontSize: 13, fontWeight: '900' },
  tenureText: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, width: '100%', opacity: 0.25, marginBottom: 2 },
  careerValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },

  // 직종 캐릭터 카드
  characterCard: {
    width: 110, height: 145, borderRadius: 24, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginLeft: 14,
  },
  characterCircle: {
    width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  characterEmoji: { fontSize: 42 },
  jobBadge: { marginTop: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  jobBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // 섹션 공통
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  countBadge: { fontSize: 15, fontWeight: '800' },

  // 체크리스트
  routineListCard: { borderRadius: 20, borderWidth: 1, paddingVertical: 4 },
  routineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14 },
  routineText: { fontSize: 15, fontWeight: '600', marginLeft: 12, flex: 1 },
  emptyRoutine: { textAlign: 'center', padding: 16, fontSize: 14 },

  // 달성률
  achievementHint: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  percentText: { fontSize: 18, fontWeight: '900' },
  countText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  progressBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },

  // 응원 카드
  encouragementCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 8,
  },
  encouragementEmoji: { fontSize: 34, marginRight: 16 },
  encouragementBody: { flex: 1 },
  encouragementLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  encouragementText: { fontSize: 15, fontWeight: '700', lineHeight: 22 },

  // 직종 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '78%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  jobGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  jobItem: {
    width: (width - 64) / 3,
    paddingVertical: 14, paddingHorizontal: 8,
    borderRadius: 18, borderWidth: 2, marginBottom: 10, alignItems: 'center',
  },
  jobIconCircle: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  jobModalEmoji: { fontSize: 28 },
  jobModalLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
});
