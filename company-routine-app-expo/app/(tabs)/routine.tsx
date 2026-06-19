import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format } from 'date-fns';
import { useAppTheme, isRoutineActiveOnDate } from '../_layout';

// ── Calendar locale ───────────────────────────────────────────────
LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';


// ── Screen ────────────────────────────────────────────────────────
export default function RoutineScreen() {
  const {
    colors, routines,
    addRoutine, addRoutinesBulk, deleteRoutine,
    completionData, toggleRoutineCompletion,
    registerTourTarget,
  } = useAppTheme();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Add-form state
  const [newTask, setNewTask] = useState('');

  // Tour refs
  const calendarRef   = useRef<View>(null);
  const dateRecordRef = useRef<View>(null);
  const addRef        = useRef<View>(null);
  const newTaskInputRef = useRef<TextInput>(null);

  useEffect(() => {
    registerTourTarget('routineCalendar',   calendarRef   as React.RefObject<View>);
    registerTourTarget('routineDateRecord', dateRecordRef as React.RefObject<View>);
    registerTourTarget('routineAdd',        addRef        as React.RefObject<View>);
  }, []);

  const isEditable = true; // 과거/오늘/미래 모든 날짜 편집 가능

  // ── Derived data ───────────────────────────────────────────────
  const activeRoutines = useMemo(
    () => routines.filter(r => isRoutineActiveOnDate(r, selectedDate)),
    [routines, selectedDate],
  );

  const completedIds   = completionData[selectedDate] ?? [];
  const completedCount = completedIds.filter(id => activeRoutines.some(r => r.id === id)).length;
  const progress = activeRoutines.length > 0
    ? (completedCount / activeRoutines.length) * 100
    : 0;

  // Calendar marks: 모든 계획을 완료한 날짜에만 빨간 반투명 원 표시
  const markedDates = useMemo(() => {
    const marks: any = {};

    Object.keys(completionData).forEach(date => {
      const doneIds    = completionData[date] ?? [];
      if (doneIds.length === 0) return;

      const dayRoutines = routines.filter(r => isRoutineActiveOnDate(r, date));
      if (dayRoutines.length === 0) return; // 계획 없는 날은 표시 안 함

      const allDone = dayRoutines.every(r => doneIds.includes(r.id));
      if (!allDone) return; // 일부만 완료 → 표시 안 함

      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: 'rgba(255, 59, 48, 0.22)',
            borderRadius: 16,
          },
          text: { color: colors.textMain, fontWeight: '800' },
        },
      };
    });

    // 선택된 날짜: 기존 customStyles 위에 selected 스타일 덮어쓰기
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: '#FFFFFF',
    };

    return marks;
  }, [completionData, routines, selectedDate, colors]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newTask.trim()) return;
    // 선택한 날짜 하루에만 표시 (endDate = 다음 날)
    const nextDay = new Date(selectedDate + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = format(nextDay, 'yyyy-MM-dd');
    addRoutinesBulk([{ task: newTask.trim(), repeat: 'daily', startDate: selectedDate, endDate }]);
    setNewTask('');
  };

  const handleDelete = (id: number) => {
    // 선택한 날짜에서만 제거, 다른 날짜는 그대로
    deleteRoutine(id, selectedDate);
  };

const handleCopyFromYesterday = () => {
    const prevDay = new Date(selectedDate + 'T00:00:00');
    prevDay.setDate(prevDay.getDate() - 1);
    const yesterdayStr = format(prevDay, 'yyyy-MM-dd');

    const yesterdayRoutines = routines.filter(r => isRoutineActiveOnDate(r, yesterdayStr));
    if (yesterdayRoutines.length === 0) {
      Alert.alert('복사할 계획 없음', '전날 등록된 계획이 없습니다.');
      return;
    }

    const nextDay = new Date(selectedDate + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = format(nextDay, 'yyyy-MM-dd');

    const items = yesterdayRoutines.map(r => ({
      task: r.task,
      repeat: 'daily' as const,
      startDate: selectedDate,
      endDate,
    }));

    const doCopy = () => addRoutinesBulk(items);

    if (activeRoutines.length > 0) {
      Alert.alert(
        '기존 계획이 있습니다',
        '이 날짜에 이미 계획이 있습니다.\n전날 계획을 추가로 복사할까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '복사하기', onPress: doCopy },
        ],
      );
    } else {
      doCopy();
    }
  };

  // ── Labels ────────────────────────────────────────────────────
  const dateLabel = (() => {
    if (selectedDate === todayStr) return '오늘의 계획';
    const d = new Date(selectedDate + 'T00:00:00');
    return `${format(d, 'M월 d일')} 계획`;
  })();

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.textMain }]}>계획</Text>

          {/* ── 달력 ──────────────────────────────────────────── */}
          <View
            ref={calendarRef}
            style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
              markingType="custom"
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
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          </View>

          {/* ── 날짜별 계획 & 기록 ────────────────────────────── */}
          <View ref={dateRecordRef}>
            {/* Header */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{dateLabel}</Text>
              </View>
              <View style={styles.badgeGroup}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '1E' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {completedCount}/{activeRoutines.length}
                  </Text>
                </View>
                {activeRoutines.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.primary + '14', marginLeft: 6 }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBg, { backgroundColor: colors.border + '60' }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: `${progress}%` as any },
                ]}
              />
            </View>

            {/* Plan list */}
            {activeRoutines.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textMain }]}>아직 계획이 없어요 📝</Text>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>
                  어제 계획을 복사하거나 새 계획을 만들어보세요.
                </Text>
                {isEditable && (
                  <View style={styles.emptyBtnRow}>
                    <TouchableOpacity
                      style={[styles.copyBtn, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '50', flex: 1 }]}
                      onPress={handleCopyFromYesterday}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="copy-outline" size={15} color={colors.primary} />
                      <Text style={[styles.copyBtnText, { color: colors.primary }]}>어제 계획 복사</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.copyBtn, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
                      onPress={() => newTaskInputRef.current?.focus()}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle-outline" size={15} color={colors.textSub} />
                      <Text style={[styles.copyBtnText, { color: colors.textSub }]}>새 계획 만들기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              activeRoutines.map(r => {
                const done = completedIds.includes(r.id);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.routineRow,
                      { backgroundColor: colors.card, borderColor: done ? 'transparent' : colors.border },
                      done && { opacity: 0.7 },
                    ]}
                    onPress={() => toggleRoutineCompletion(selectedDate, r.id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={done ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={done ? colors.primary : colors.textSub}
                    />
                    <Text
                      style={[
                        styles.routineText,
                        { color: colors.textMain },
                        done && { textDecorationLine: 'line-through', color: colors.textSub },
                      ]}
                    >
                      {r.task}
                    </Text>

                    {/* 삭제 버튼 — 편집 가능한 날만 */}
                    {isEditable && (
                      <TouchableOpacity
                        onPress={() => handleDelete(r.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ marginLeft: 6 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.textSub} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* ── 계획 추가 (오늘 + 미래만) ────────────────────── */}
          {isEditable && (
            <View
              ref={addRef}
              style={[styles.addSection, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.addTitle, { color: colors.textMain }]}>계획 추가</Text>

              <TextInput
                ref={newTaskInputRef}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textMain }]}
                placeholder="새 계획 내용을 입력하세요"
                placeholderTextColor={colors.textSub}
                value={newTask}
                onChangeText={setNewTask}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />

              <TouchableOpacity
                style={[
                  styles.addBtn,
                  { backgroundColor: newTask.trim() ? colors.primary : colors.border },
                ]}
                onPress={handleAdd}
                disabled={!newTask.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addBtnText}>추가하기</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },

  calendarCard: {
    borderRadius: 20, borderWidth: 1,
    overflow: 'hidden', marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionSub:   { fontSize: 11, fontWeight: '600', marginTop: 2 },
  badgeGroup:   { flexDirection: 'row', alignItems: 'center' },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:    { fontSize: 12, fontWeight: '800' },

  progressBg:   { height: 8, borderRadius: 4, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  emptyCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 24, alignItems: 'center', gap: 8,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 18 },
  emptyBtnRow: { flexDirection: 'row', gap: 8, width: '100%', marginTop: 4 },

  copyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  copyBtnText: { fontSize: 13, fontWeight: '700' },

  routineRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 16, borderWidth: 1,
    marginBottom: 8,
  },
  routineText:    { flex: 1, fontSize: 15, fontWeight: '600', marginLeft: 10 },
  addSection: {
    borderRadius: 22, borderWidth: 1,
    padding: 18, marginTop: 8,
  },
  addTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  input: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: '500', marginBottom: 14,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 50, borderRadius: 16, gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
