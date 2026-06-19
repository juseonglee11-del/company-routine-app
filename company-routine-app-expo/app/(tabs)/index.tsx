import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, differenceInYears } from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme, isRoutineActiveOnDate } from '../_layout';
import { JOB_CHARACTERS, JOB_CATEGORIES, JOIN_DATE_KEY, JobType } from '@/constants/jobs';
import { Quote, getRandomQuote } from '@/constants/quotes';
import { TOUR_SEEN_KEY } from '@/components/TourOverlay';
import AdBanner from '@/components/AdBanner';

const { width } = Dimensions.get('window');
const THEME_HINT_KEY = '@theme_hint_dismissed';
const DAILY_QUOTE_KEY = '@daily_quote';

export default function HomeScreen() {
  const {
    theme,
    toggleTheme,
    colors,
    userProfile,
    selectedJob,
    updateJob,
    routines,
    completionData,
    toggleRoutineCompletion,
    isLoaded,
    registerTourTarget,
    startTour,
  } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ welcome?: string }>();
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const joinDateRef = useRef<View>(null);
  const checklistRef = useRef<View>(null);
  const themeButtonRef = useRef<View>(null);
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const [modalCategoryKey, setModalCategoryKey] = useState<string | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [showThemeHint, setShowThemeHint] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<Quote>({ text: '작은 습관이 큰 변화를 만듭니다', icon: '🌱' });

  // Register tour target refs once on mount
  useEffect(() => {
    registerTourTarget('joinDate', joinDateRef as React.RefObject<View>);
    registerTourTarget('checklist', checklistRef as React.RefObject<View>);
    registerTourTarget('themeButton', themeButtonRef as React.RefObject<View>);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userProfile || !selectedJob || !JOB_CHARACTERS[selectedJob]) {
      router.replace('/onboarding');
    } else {
      loadJoinDate();
      loadDailyQuote();
      // Start tour automatically on first launch
      AsyncStorage.getItem(TOUR_SEEN_KEY).then(seen => {
        if (!seen) startTour();
      });
    }
  }, [userProfile, selectedJob, isLoaded]);

  useEffect(() => {
    AsyncStorage.getItem(THEME_HINT_KEY).then(val => {
      if (val === null) setShowThemeHint(true);
    });
  }, []);

  useEffect(() => {
    if (params.welcome !== '1') return;
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismissThemeHint = async () => {
    setShowThemeHint(false);
    await AsyncStorage.setItem(THEME_HINT_KEY, 'true');
  };

  const handleToggleTheme = async () => {
    await toggleTheme();
    if (showThemeHint) await dismissThemeHint();
  };

  const loadDailyQuote = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const saved = await AsyncStorage.getItem(DAILY_QUOTE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setDailyQuote({ text: parsed.text, icon: parsed.icon });
        return;
      }
    }
    const quote = getRandomQuote();
    setDailyQuote(quote);
    await AsyncStorage.setItem(DAILY_QUOTE_KEY, JSON.stringify({ date: today, ...quote }));
  };

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
  const todayRoutines = routines.filter(r => isRoutineActiveOnDate(r, todayStr));
  const totalRoutinesCount = todayRoutines.length;
  const todayCompletedCount = (completionData[todayStr] || []).filter(id => todayRoutines.some(r => r.id === id)).length;
  const todayProgress = totalRoutinesCount > 0 ? (todayCompletedCount / totalRoutinesCount) * 100 : 0;

  if (!isLoaded || !userProfile || !selectedJob || !JOB_CHARACTERS[selectedJob]) return null;

  const currentChar = JOB_CHARACTERS[selectedJob];
  const today = new Date();
  const daysElapsed = joinDate ? differenceInDays(today, joinDate) + 1 : 0;
  const yearsOfService = joinDate ? differenceInYears(today, joinDate) : 0;
  const months = Math.floor(daysElapsed / 30) % 12;
  const totalTenure = yearsOfService > 0
    ? `${yearsOfService}년 ${months}개월`
    : `${Math.floor(daysElapsed / 30)}개월`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 10 : 0 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSub }]}>오늘도 나답게 한 걸음씩 🚀</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.textMain }]}>{userProfile.nickname}</Text>
              <TouchableOpacity
                onPress={() => setIsJobModalVisible(true)}
                style={[styles.characterMiniBtn, { backgroundColor: currentChar.secondaryColor }]}
              >
                <Text style={styles.characterMiniEmoji}>{currentChar.emoji}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.themeHintWrapper}>
              <TouchableOpacity
                ref={themeButtonRef}
                onPress={handleToggleTheme}
                style={[
                  styles.iconButton,
                  showThemeHint && { borderWidth: 2, borderColor: colors.primary, borderRadius: 20, padding: 3 },
                ]}
              >
                <Ionicons
                  name={
                    theme === 'dark' ? 'moon' :
                    theme === 'pink' ? 'color-palette' :
                    theme === 'blue' ? 'water' :
                    theme === 'green' ? 'leaf' :
                    theme === 'yellow' ? 'sunny-outline' :
                    'sunny'
                  }
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              {showThemeHint && (
                <TouchableOpacity
                  onPress={dismissThemeHint}
                  activeOpacity={0.8}
                  style={[styles.themeHintBubble, { backgroundColor: colors.primary }]}
                >
                  <View style={[styles.themeHintArrow, { backgroundColor: colors.primary }]} />
                  <Text style={styles.themeHintText}>배경을 변경해보세요</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. 입사일 카드 */}
        {joinDate ? (
          // 등록 완료 — 근속 정보 카드
          <TouchableOpacity
            ref={joinDateRef}
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
        ) : (
          // 미등록 — 안내 카드
          <View
            ref={joinDateRef}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.textSub }]}>📅 입사일을 등록해보세요</Text>
                <Text style={[styles.registerSubtext, { color: colors.textSub }]}>
                  근속일을 자동으로 계산해드려요.
                </Text>
                <TouchableOpacity
                  style={[styles.registerBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setDatePickerVisibility(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={styles.registerBtnText}>입사일 등록하기</Text>
                </TouchableOpacity>
              </View>
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
          </View>
        )}

        {/* 2. 오늘의 체크리스트 */}
        <View ref={checklistRef} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>오늘의 체크리스트 📝</Text>
            <Text style={[styles.countBadge, { color: colors.primary }]}>
              {todayCompletedCount}/{totalRoutinesCount}
            </Text>
          </View>
          <View style={[styles.routineListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {todayRoutines.length > 0 ? (
              todayRoutines.map((item) => {
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
                계획 탭에서 계획을 추가해보세요 ✏️
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
        <View
          style={[styles.encouragementCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={styles.encouragementEmoji}>{dailyQuote.icon}</Text>
          <View style={styles.encouragementBody}>
            <Text style={[styles.encouragementLabel, { color: colors.textSub }]}>오늘의 응원</Text>
            <Text style={[styles.encouragementText, { color: colors.textMain }]}>
              {dailyQuote.text}
            </Text>
          </View>
        </View>

        {/* 5. 광고 배너 — 탭바 바로 위 */}
        <AdBanner />

      </ScrollView>

      {/* DateTimePicker — ScrollView 밖에 조건부 렌더링 (New Architecture 호환) */}
      {isDatePickerVisible && (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
          date={joinDate ?? new Date()}
          maximumDate={new Date()}
          minimumDate={new Date(1980, 0, 1)}
        />
      )}

      {/* 직종 선택 모달 — ScrollView 밖 */}
      <Modal visible={isJobModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              {modalCategoryKey ? (
                <TouchableOpacity onPress={() => setModalCategoryKey(null)} style={styles.modalBackBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                  <Text style={[styles.modalBackText, { color: colors.primary }]}>
                    {JOB_CATEGORIES.find(c => c.key === modalCategoryKey)?.emoji}{' '}
                    {JOB_CATEGORIES.find(c => c.key === modalCategoryKey)?.label}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>직종 변경</Text>
              )}
              <TouchableOpacity onPress={() => {
                setIsJobModalVisible(false);
                setModalCategoryKey(null);
                setModalSearchQuery('');
              }}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            {/* 검색바 */}
            <View style={[styles.modalSearchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={17} color={colors.textSub} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.textMain }]}
                placeholder="직업을 검색하세요"
                placeholderTextColor={colors.textSub}
                value={modalSearchQuery}
                onChangeText={text => {
                  setModalSearchQuery(text);
                  if (text.length > 0) setModalCategoryKey(null);
                }}
              />
              {modalSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setModalSearchQuery('')}>
                  <Ionicons name="close-circle" size={17} color={colors.textSub} />
                </TouchableOpacity>
              )}
            </View>

            {/* 피커 콘텐츠 */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalPickerContent}>
              {(() => {
                const trimmed = modalSearchQuery.trim().toLowerCase();
                const isSearching = trimmed.length > 0;
                const currentCat = modalCategoryKey
                  ? JOB_CATEGORIES.find(c => c.key === modalCategoryKey)
                  : null;
                const filteredKeys: JobType[] = isSearching
                  ? (Object.keys(JOB_CHARACTERS) as JobType[]).filter(k =>
                      JOB_CHARACTERS[k].label.toLowerCase().includes(trimmed)
                    )
                  : [];

                const renderRow = (key: JobType) => {
                  const item = JOB_CHARACTERS[key];
                  const isSelected = selectedJob === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.modalJobRow,
                        {
                          backgroundColor: isSelected ? item.secondaryColor : colors.background,
                          borderColor: isSelected ? item.color : colors.border,
                        },
                      ]}
                      onPress={() => {
                        updateJob(key);
                        setIsJobModalVisible(false);
                        setModalCategoryKey(null);
                        setModalSearchQuery('');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.modalJobIcon, { backgroundColor: isSelected ? '#fff' : item.secondaryColor }]}>
                        <Text style={styles.modalJobEmoji}>{item.emoji}</Text>
                      </View>
                      <Text style={[styles.modalJobLabel, { color: isSelected ? item.color : colors.textMain }]}>
                        {item.label}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={item.color} />}
                    </TouchableOpacity>
                  );
                };

                if (isSearching) {
                  return filteredKeys.length === 0
                    ? <Text style={[styles.modalEmpty, { color: colors.textSub }]}>검색 결과가 없습니다</Text>
                    : <>{filteredKeys.map(renderRow)}</>;
                }
                if (currentCat) {
                  return <>{currentCat.jobKeys.map(renderRow)}</>;
                }
                return (
                  <View style={styles.modalCategoryGrid}>
                    {JOB_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.modalCategoryCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => setModalCategoryKey(cat.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalCategoryEmoji}>{cat.emoji}</Text>
                        <Text style={[styles.modalCategoryLabel, { color: colors.textMain }]}>{cat.label}</Text>
                        <Ionicons name="chevron-forward" size={13} color={colors.textSub} />
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 가입 완료 토스트 */}
      {params.welcome === '1' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>기본 계획 4개가 생성되었습니다 🎉</Text>
        </Animated.View>
      )}

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
  themeHintWrapper: { position: 'relative' },
  themeHintBubble: {
    position: 'absolute',
    top: 42,
    right: -4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    zIndex: 100,
    minWidth: 138,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  themeHintArrow: {
    position: 'absolute',
    top: -5,
    right: 14,
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
  },
  themeHintText: { color: '#fff', fontSize: 12, fontWeight: '700' },

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

  // 입사일 미등록 카드
  registerSubtext: { fontSize: 13, fontWeight: '500', marginTop: 6, marginBottom: 16, lineHeight: 19 },
  registerBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
  },
  registerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },

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
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '82%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBackBtn: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalBackText: { fontSize: 15, fontWeight: '700', marginLeft: 4 },
  modalSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1.5, marginBottom: 12,
  },
  modalSearchInput: { flex: 1, fontSize: 14, fontWeight: '500', marginLeft: 7, marginRight: 4 },
  modalPickerContent: { paddingBottom: 20 },
  modalCategoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modalCategoryCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1.5, marginBottom: 9,
  },
  modalCategoryEmoji: { fontSize: 18, marginRight: 7 },
  modalCategoryLabel: { flex: 1, fontSize: 12, fontWeight: '700' },
  modalJobRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 7,
  },
  modalJobIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  modalJobEmoji: { fontSize: 20 },
  modalJobLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },

  // 토스트
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: 'rgba(30,30,30,0.88)',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24, zIndex: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
