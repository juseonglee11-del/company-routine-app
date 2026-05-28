import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Constants & Colors ---
const COLORS = {
  primary: '#1A73E8', // Deep Blue for trust
  secondary: '#5F6368', // Slate Gray for stability
  background: '#F8F9FA', // Light gray background
  white: '#FFFFFF',
  textMain: '#202124',
  textSub: '#5F6368',
  border: '#DADCE0',
  success: '#34A853',
};

// --- Utilities ---
const calculateDaysSince = (dateString: string) => {
  const joinDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// --- Main Component ---
export default function App() {
  const [joinDate, setJoinDate] = useState('2024-01-01');
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [routines, setRoutines] = useState([
    { id: 1, task: '출근 체크 및 메일 확인', completed: false },
    { id: 2, task: '오늘의 할 일(To-do) 우선순위 설정', completed: true },
    { id: 3, task: '오전 집중 업무 시간 (Deep Work)', completed: false },
    { id: 4, task: '점심 휴식 및 팀 미팅 준비', completed: false },
    { id: 5, task: '오후 업무 리포트 및 내일 일정 정리', completed: false },
  ]);
  const [newRoutine, setNewRoutine] = useState('');

  useEffect(() => {
    setDaysElapsed(calculateDaysSince(joinDate));
  }, [joinDate]);

  const toggleRoutine = (id: number) => {
    setRoutines(
      routines.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    );
  };

  const addRoutine = () => {
    if (newRoutine.trim().length > 0) {
      setRoutines([
        ...routines,
        { id: Date.now(), task: newRoutine, completed: false },
      ]);
      setNewRoutine('');
    }
  };

  const deleteRoutine = (id: number) => {
    setRoutines(routines.filter((r) => r.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Professional Routine</Text>
            <Text style={styles.headerSubtitle}>오늘도 힘차게 시작해볼까요? 😊</Text>
          </View>

          {/* D-Day Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="briefcase" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>나의 커리어 현황</Text>
            </View>
            <View style={styles.dDayContainer}>
              <View>
                <Text style={styles.dDayLabel}>입사일</Text>
                <Text style={styles.dDayDate}>{joinDate}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.dDayBadge}>
                <Text style={styles.dDayText}>D + {daysElapsed}</Text>
              </View>
            </View>
            <Text style={styles.cardFooter}>
              어느덧 회사와 함께한 지 <Text style={{fontWeight: '700', color: COLORS.primary}}>{daysElapsed}일</Text>째입니다.
            </Text>
          </View>

          {/* Routine Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>데일리 루틴</Text>
            <Text style={styles.sectionCount}>{routines.filter(r => r.completed).length}/{routines.length}</Text>
          </View>

          {routines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.routineItem, item.completed && styles.routineItemCompleted]}
              onPress={() => toggleRoutine(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.routineLeft}>
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={item.completed ? COLORS.success : COLORS.border}
                />
                <Text style={[styles.routineText, item.completed && styles.routineTextCompleted]}>
                  {item.task}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteRoutine(item.id)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Add Routine Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="새로운 루틴을 추가하세요..."
              value={newRoutine}
              onChangeText={setNewRoutine}
              onSubmitEditing={addRoutine}
            />
            <TouchableOpacity style={styles.addButton} onPress={addRoutine}>
              <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSub,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  dDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F3F4',
    padding: 16,
    borderRadius: 12,
  },
  dDayLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  dDayDate: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  dDayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dDayText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
  },
  cardFooter: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSub,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routineItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routineItemCompleted: {
    backgroundColor: '#F8F9FA',
    borderColor: 'transparent',
  },
  routineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  routineText: {
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  routineTextCompleted: {
    color: COLORS.border,
    textDecorationLine: 'line-through',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
