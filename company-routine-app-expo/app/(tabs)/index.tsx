import React, { useState, useEffect, useMemo } from 'react';
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
import { format, differenceInDays, differenceInYears, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../_layout';
import { JOB_CHARACTERS, JOIN_DATE_KEY, JobType } from '@/constants/jobs';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, toggleTheme, colors, selectedJob, updateJob, routines, completionData, toggleRoutineCompletion } = useAppTheme();
  const router = useRouter();
  const [joinDate, setJoinDate] = useState(new Date(2024, 0, 1));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);

  useEffect(() => {
    if (!selectedJob) {
      router.replace('/onboarding');
    }
    loadJoinDate();
  }, [selectedJob]);

  const loadJoinDate = async () => {
    const savedDate = await AsyncStorage.getItem(JOIN_DATE_KEY);
    if (savedDate) setJoinDate(new Date(savedDate));
  };

  const handleConfirmDate = async (date: Date) => {
    setJoinDate(date);
    setDatePickerVisibility(false);
    await AsyncStorage.setItem(JOIN_DATE_KEY, date.toISOString());
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompletedCount = (completionData[todayStr] || []).length;
  const totalRoutinesCount = routines.length;

  // Weekly Stats
  const weekStats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    
    let totalPossible = days.length * routines.length;
    let totalCompleted = 0;
    
    days.forEach(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      totalCompleted += (completionData[dStr] || []).length;
    });
    
    return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  }, [completionData, routines]);

  if (!selectedJob) return null;

  const currentChar = JOB_CHARACTERS[selectedJob];
  const today = new Date();
  const daysElapsed = differenceInDays(today, joinDate) + 1;
  const yearsOfService = differenceInYears(today, joinDate);
  const totalTenure = `${yearsOfService}년 ${Math.floor(daysElapsed / 30) % 12}개월`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSub }]}>오늘도 멋진 하루 응원할게요</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textMain }]}>직장인 성장 관리</Text>
              <TouchableOpacity onPress={() => setIsJobModalVisible(true)} style={styles.characterMiniBtn}>
                <Text style={styles.miniEmoji}>{currentChar.emoji}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Join Date Card */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
          onPress={() => setDatePickerVisibility(true)}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, { color: colors.textSub }]}>입사일 (터치하여 변경)</Text>
              <Text style={[styles.cardValue, { color: colors.textMain }]}>{format(joinDate, 'yyyy.MM.dd')}</Text>
              
              <View style={styles.tenureContainer}>
                <View style={[styles.badge, { backgroundColor: currentChar.color + '20' }]}>
                  <Text style={[styles.badgeText, { color: currentChar.color }]}>D + {daysElapsed}</Text>
                </View>
                <Text style={[styles.tenureText, { color: colors.textSub }]}>{yearsOfService}년차</Text>
              </View>
              <View style={styles.divider} />
              <Text style={[styles.cardLabel, { color: colors.textSub, marginTop: 10 }]}>현재 회사 근속</Text>
              <Text style={[styles.careerValue, { color: colors.textMain }]}>{totalTenure}</Text>
            </View>
            <View style={[styles.characterCard, { backgroundColor: currentChar.color + '15', borderColor: currentChar.color + '40' }]}>
              <View style={styles.characterCircle}>
                <Text style={styles.characterEmojiLarge}>{currentChar.emoji}</Text>
              </View>
              <View style={[styles.jobBadge, { backgroundColor: currentChar.color }]}>
                <Text style={styles.jobBadgeText}>{currentChar.label}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Today's Routine Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>오늘의 루틴</Text>
            <Text style={[styles.countBadge, { color: colors.primary }]}>{todayCompletedCount}/{totalRoutinesCount}</Text>
          </View>
          
          <View style={[styles.routineListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {routines.length > 0 ? routines.map((item) => {
              const isCompleted = (completionData[todayStr] || []).includes(item.id);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.routineRow}
                  onPress={() => toggleRoutineCompletion(todayStr, item.id)}
                >
                  <Ionicons 
                    name={isCompleted ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={isCompleted ? colors.primary : colors.textSub} 
                  />
                  <Text style={[
                    styles.routineText, 
                    { color: colors.textMain },
                    isCompleted && { textDecorationLine: 'line-through', color: colors.textSub }
                  ]}>
                    {item.task}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text style={{ color: colors.textSub, textAlign: 'center', padding: 10 }}>등록된 루틴이 없습니다.</Text>
            )}
          </View>
        </View>

        {/* Weekly Achievement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>이번 주 달성률</Text>
            <Text style={[styles.percentText, { color: colors.primary }]}>{Math.round(weekStats)}%</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border + '50' }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${weekStats}%` }]} />
          </View>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          date={joinDate}
        />

        {/* Job Selection Modal */}
        <Modal visible={isJobModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>직종 변경</Text>
                <TouchableOpacity onPress={() => setIsJobModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.jobGrid}>
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
                      style={[
                        styles.jobItem,
                        { backgroundColor: isSelected ? item.color + '20' : colors.background, borderColor: isSelected ? item.color : colors.border }
                      ]}
                    >
                      <Text style={styles.jobEmoji}>{item.emoji}</Text>
                      <Text style={[styles.jobLabel, { color: isSelected ? item.color : colors.textMain }]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: Platform.OS === 'android' ? 10 : 0 },
  greeting: { fontSize: 14, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  title: { fontSize: 22, fontWeight: '800' },
  characterMiniBtn: { marginLeft: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 },
  miniEmoji: { fontSize: 20 },
  headerActions: { flexDirection: 'row' },
  iconButton: { marginLeft: 15, padding: 5 },
  card: { borderRadius: 28, padding: 20, borderWidth: 1, elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, marginBottom: 28 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  cardValue: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  tenureContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, marginRight: 10 },
  badgeText: { fontSize: 13, fontWeight: '900' },
  tenureText: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, width: '100%', backgroundColor: 'rgba(150, 150, 150, 0.15)' },
  careerValue: { fontSize: 19, fontWeight: '800' },
  characterCard: { width: 110, height: 140, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 15 },
  characterCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  characterEmojiLarge: { fontSize: 44 },
  jobBadge: { marginTop: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  jobBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  countBadge: { fontSize: 15, fontWeight: '800' },
  percentText: { fontSize: 18, fontWeight: '900' },
  routineListCard: { borderRadius: 20, borderWidth: 1, padding: 10 },
  routineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  routineText: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
  progressBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  jobGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  jobItem: { width: (width - 64) / 2, padding: 16, borderRadius: 20, borderWidth: 1.5, marginBottom: 12, alignItems: 'center' },
  jobEmoji: { fontSize: 32, marginBottom: 8 },
  jobLabel: { fontSize: 14, fontWeight: '700' },
});
