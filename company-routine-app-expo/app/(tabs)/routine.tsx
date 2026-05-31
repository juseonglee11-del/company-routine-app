import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAppTheme } from '../_layout';

// Calendar Locale Configuration
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

export default function RoutineScreen() {
  const { colors, routines, addRoutine, deleteRoutine, completionData, toggleRoutineCompletion } = useAppTheme();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [newRoutine, setNewRoutine] = useState('');

  const handleAddRoutine = () => {
    if (newRoutine.trim()) {
      addRoutine(newRoutine);
      setNewRoutine('');
    }
  };

  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.keys(completionData).forEach(date => {
      const completedIds = completionData[date];
      if (completedIds.length > 0) {
        marks[date] = { marked: true, dotColor: colors.primary };
      }
    });
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#FFFFFF',
    };
    return marks;
  }, [completionData, selectedDate, colors]);

  const currentCompleted = completionData[selectedDate] || [];
  const progress = routines.length > 0 ? (currentCompleted.length / routines.length) * 100 : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.title, { color: colors.textMain }]}>루틴 달력</Text>

          {/* Calendar Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: 'hidden' }]}>
            <Calendar
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.card,
                calendarBackground: colors.card,
                textSectionTitleColor: colors.textSub,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: colors.primary,
                dayTextColor: colors.textMain,
                textDisabledColor: colors.textSub + '50',
                dotColor: colors.primary,
                selectedDotColor: '#FFFFFF',
                arrowColor: colors.primary,
                monthTextColor: colors.textMain,
                indicatorColor: colors.primary,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          </View>

          {/* Progress Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
              {selectedDate === todayStr ? '오늘의 루틴' : `${format(new Date(selectedDate), 'M월 d일')} 루틴`}
            </Text>
            <View style={[styles.progressBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.progressText, { color: colors.primary }]}>{Math.round(progress)}% 완료</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: colors.border + '50' }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
          </View>

          {/* Routine List */}
          {routines.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.routineItem,
                { backgroundColor: colors.card, borderColor: currentCompleted.includes(item.id) ? 'transparent' : colors.border },
                currentCompleted.includes(item.id) && { opacity: 0.6 }
              ]}
              onPress={() => toggleRoutineCompletion(selectedDate, item.id)}
            >
              <View style={styles.routineLeft}>
                <Ionicons
                  name={currentCompleted.includes(item.id) ? "checkbox" : "square-outline"}
                  size={24}
                  color={currentCompleted.includes(item.id) ? colors.primary : colors.textSub}
                />
                <Text style={[
                  styles.routineText,
                  { color: colors.textMain },
                  currentCompleted.includes(item.id) && { textDecorationLine: 'line-through', color: colors.textSub }
                ]}>
                  {item.task}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteRoutine(item.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.textSub} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Add Routine */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="새로운 루틴 추가..."
              placeholderTextColor={colors.textSub}
              value={newRoutine}
              onChangeText={setNewRoutine}
            />
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddRoutine}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 24, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  progressBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  progressText: { fontSize: 13, fontWeight: '800' },
  progressBarBg: { height: 8, borderRadius: 4, marginBottom: 20, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
  },
  routineLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  routineText: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
  inputRow: { flexDirection: 'row', marginTop: 10 },
  input: { flex: 1, height: 50, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16, marginRight: 10 },
  addButton: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
