import React, { useState, useEffect, useMemo } from 'react';
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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO, isSameDay } from 'date-fns';

// --- Calendar Locale Configuration ---
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

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
  today: '#E8F0FE',
  marker: '#34A853',
};

// --- Utilities ---
const calculateDaysSince = (dateString: string) => {
  try {
    const joinDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    joinDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - joinDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 0 : diffDays;
  } catch (e) {
    return 0;
  }
};

export default function HomeScreen() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [joinDate, setJoinDate] = useState('2024-01-01');
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Master list of routines
  const [routines, setRoutines] = useState([
    { id: 1, task: '출근 체크 및 메일 확인' },
    { id: 2, task: '오늘의 할 일(To-do) 우선순위 설정' },
    { id: 3, task: '오전 집중 업무 시간 (Deep Work)' },
    { id: 4, task: '점심 휴식 및 팀 미팅 준비' },
    { id: 5, task: '오후 업무 리포트 및 내일 일정 정리' },
  ]);

  // Completion data: { 'YYYY-MM-DD': [id1, id2] }
  const [completionData, setCompletionData] = useState<{ [key: string]: number[] }>({
    [todayStr]: [2], // Example: item 2 completed today
  });

  const [newRoutine, setNewRoutine] = useState('');

  useEffect(() => {
    setDaysElapsed(calculateDaysSince(joinDate));
  }, [joinDate]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmJoinDate = (date: Date) => {
    setJoinDate(format(date, 'yyyy-MM-dd'));
    hideDatePicker();
  };

  const toggleRoutine = (id: number) => {
    const currentCompleted = completionData[selectedDate] || [];
    let newCompleted;
    if (currentCompleted.includes(id)) {
      newCompleted = currentCompleted.filter(item => item !== id);
    } else {
      newCompleted = [...currentCompleted, id];
    }
    setCompletionData({
      ...completionData,
      [selectedDate]: newCompleted,
    });
  };

  const addRoutine = () => {
    if (newRoutine.trim().length > 0) {
      const newId = Date.now();
      setRoutines([
        ...routines,
        { id: newId, task: newRoutine },
      ]);
      setNewRoutine('');
    }
  };

  const deleteRoutine = (id: number) => {
    setRoutines(routines.filter((r) => r.id !== id));
    // Also clean up completion data across all dates if needed, 
    // but for simplicity we'll just leave them (they won't show up anyway)
  };

  // Calendar Marking Logic
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // 1. Highlight Completed Dates
    Object.keys(completionData).forEach(date => {
      const completedIds = completionData[date];
      if (completedIds.length > 0 && routines.length > 0) {
        const isAllCompleted = routines.every(r => completedIds.includes(r.id));
        marks[date] = {
          marked: true,
          dotColor: isAllCompleted ? COLORS.success : COLORS.primary,
        };
      }
    });

    // 2. Highlight Today
    if (!marks[todayStr]) {
      marks[todayStr] = { 
        customStyles: {
          container: { backgroundColor: COLORS.today, borderRadius: 8 },
          text: { color: COLORS.primary, fontWeight: 'bold' }
        }
      };
    } else {
      marks[todayStr] = {
        ...marks[todayStr],
        customStyles: {
          container: { backgroundColor: COLORS.today, borderRadius: 8 },
          text: { color: COLORS.primary, fontWeight: 'bold' }
        }
      };
    }

    // 3. Highlight Selected Date
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
      selectedTextColor: COLORS.white,
    };

    return marks;
  }, [completionData, selectedDate, routines, todayStr]);

  const currentDayCompleted = completionData[selectedDate] || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Professional Routine</Text>
            <Text style={styles.headerSubtitle}>오늘도 성실하게, 나만의 커리어를 쌓아요! 💼</Text>
          </View>

          {/* D-Day Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>근태 및 커리어 관리</Text>
            </View>
            <View style={styles.dDayContainer}>
              <TouchableOpacity style={styles.datePickerTrigger} onPress={showDatePicker}>
                <Text style={styles.dDayLabel}>입사일 (선택)</Text>
                <Text style={styles.dDayDateText}>{joinDate}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <View style={styles.dDayBadge}>
                <Text style={styles.dDayText}>D + {daysElapsed}</Text>
              </View>
            </View>
          </View>

          {/* Calendar Section */}
          <View style={styles.calendarCard}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={'custom'}
              theme={{
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                todayTextColor: COLORS.primary,
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.textMain,
                indicatorColor: COLORS.primary,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          </View>

          {/* Routine Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {selectedDate === todayStr ? '오늘의 루틴' : `${format(parseISO(selectedDate), 'M월 d일')} 루틴`}
              </Text>
            </View>
            <Text style={styles.sectionCount}>
              {currentDayCompleted.length}/{routines.length}
            </Text>
          </View>

          {routines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.routineItem, 
                currentDayCompleted.includes(item.id) && styles.routineItemCompleted
              ]}
              onPress={() => toggleRoutine(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.routineLeft}>
                <Ionicons
                  name={currentDayCompleted.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={currentDayCompleted.includes(item.id) ? COLORS.success : COLORS.border}
                />
                <Text style={[
                  styles.routineText, 
                  currentDayCompleted.includes(item.id) && styles.routineTextCompleted
                ]}>
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

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmJoinDate}
        onCancel={hideDatePicker}
        date={parseISO(joinDate)}
      />
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
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSub,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
    marginLeft: 8,
  },
  dDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F3F4',
    padding: 12,
    borderRadius: 12,
  },
  datePickerTrigger: {
    flex: 1,
  },
  dDayLabel: {
    fontSize: 11,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  dDayDateText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  dDayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dDayText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sectionCount: {
    fontSize: 13,
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
    padding: 14,
    marginBottom: 10,
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
  },
  routineText: {
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '500',
    marginLeft: 12,
  },
  routineTextCompleted: {
    color: COLORS.border,
    textDecorationLine: 'line-through',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
    marginRight: 10,
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
