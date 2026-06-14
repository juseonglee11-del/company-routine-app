import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAppTheme } from '../_layout';
import { TOUR_SEEN_KEY } from '@/components/TourOverlay';
import { JOIN_DATE_KEY } from '@/constants/jobs';
import {
  IS_EXPO_GO,
  checkNotificationPermissions,
  requestNotificationPermissions,
  manageDailyPlanNotification,
  manageIncompleteNotification,
  manageAnniversaryNotifications,
} from '@/utils/notifications';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meedbpgb';
const APP_VERSION = '1.0.0';
const PRIVACY_POLICY_URL = 'https://juseonglee11-del.github.io/company-routine-app/company-routine-app-expo/privacy-policy.html';

type InquiryType = '버그 제보' | '기능 제안' | '기타 문의';

type ThemeMode = 'light' | 'dark' | 'pink' | 'blue' | 'green' | 'yellow';

const ThemeOption = ({
  mode,
  label,
  icon,
  currentTheme,
  colors,
  onPress,
}: {
  mode: ThemeMode;
  label: string;
  icon: any;
  currentTheme: string;
  colors: any;
  onPress: (mode: ThemeMode) => void;
}) => {
  const isSelected = currentTheme === mode;
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected ? colors.primary + '20' : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={() => onPress(mode)}
    >
      <Ionicons name={icon} size={20} color={isSelected ? colors.primary : colors.textSub} />
      <Text style={[styles.themeLabel, { color: isSelected ? colors.primary : colors.textMain }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const THEME_STORAGE_KEY = '@theme_preference';

export default function SettingsScreen() {
  const { theme, setTheme, colors, userProfile, startTour, resetPlans, notifSettings, updateNotifSettings } = useAppTheme();
  const router = useRouter();

  const [supportModalVisible, setSupportModalVisible] = useState(false);

  // ── Notification settings state ──────────────────────────────────
  const [notifModalVisible, setNotifModalVisible]   = useState(false);
  const [permissionGranted, setPermissionGranted]   = useState<boolean | null>(null);
  const [joinDate, setJoinDate]                     = useState<string | null>(null);
  const [timePickerFor, setTimePickerFor]           = useState<'daily' | 'incomplete' | null>(null);
  const [inquiryType, setInquiryType] = useState<InquiryType>('버그 제보');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ── Notification handlers ─────────────────────────────────────────
  const fmtTime = (h: number, m: number) => {
    const period = h < 12 ? '오전' : '오후';
    const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${h12}:${String(m).padStart(2, '0')}`;
  };

  const getPickerDate = () => {
    const d = new Date();
    if (timePickerFor === 'daily') {
      d.setHours(notifSettings.dailyPlanHour, notifSettings.dailyPlanMinute, 0);
    } else if (timePickerFor === 'incomplete') {
      d.setHours(notifSettings.incompleteHour, notifSettings.incompleteMinute, 0);
    }
    return d;
  };

  const handleOpenNotifSettings = async () => {
    if (IS_EXPO_GO) {
      Alert.alert('알림', '알림 기능은 배포 버전에서 활성화됩니다.');
      return;
    }
    const granted = await checkNotificationPermissions();
    setPermissionGranted(granted);
    const jd = await AsyncStorage.getItem(JOIN_DATE_KEY);
    setJoinDate(jd);
    setNotifModalVisible(true);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    if (!granted) {
      Alert.alert(
        '알림 권한 필요',
        '시스템 설정에서 알림 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const handleToggleDailyPlan = async () => {
    if (!permissionGranted) { await handleRequestPermission(); return; }
    const next = !notifSettings.dailyPlanEnabled;
    await updateNotifSettings({ dailyPlanEnabled: next });
    await manageDailyPlanNotification(next, notifSettings.dailyPlanHour, notifSettings.dailyPlanMinute);
  };

  const handleToggleIncomplete = async () => {
    if (!permissionGranted) { await handleRequestPermission(); return; }
    const next = !notifSettings.incompleteEnabled;
    await updateNotifSettings({ incompleteEnabled: next });
    await manageIncompleteNotification(next, notifSettings.incompleteHour, notifSettings.incompleteMinute);
  };

  const handleToggleAnniversary = async () => {
    if (!permissionGranted) { await handleRequestPermission(); return; }
    const next = !notifSettings.anniversaryEnabled;
    await updateNotifSettings({ anniversaryEnabled: next });
    await manageAnniversaryNotifications(next, joinDate);
  };

  const handleTimeConfirm = async (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    if (timePickerFor === 'daily') {
      await updateNotifSettings({ dailyPlanHour: h, dailyPlanMinute: m });
      if (notifSettings.dailyPlanEnabled) {
        await manageDailyPlanNotification(true, h, m);
      }
    } else if (timePickerFor === 'incomplete') {
      await updateNotifSettings({ incompleteHour: h, incompleteMinute: m });
      if (notifSettings.incompleteEnabled) {
        await manageIncompleteNotification(true, h, m);
      }
    }
    setTimePickerFor(null);
  };

  const handleOpenSupport = () => {
    setInquiryType('버그 제보');
    setInquiryTitle('');
    setInquiryContent('');
    setSupportModalVisible(true);
  };

  const handleSendSupport = async () => {
    if (!inquiryTitle.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return;
    }
    if (!inquiryContent.trim()) {
      Alert.alert('입력 오류', '내용을 입력해주세요.');
      return;
    }

    setIsSending(true);
    try {
      const body: Record<string, string> = {
        type: inquiryType,
        title: inquiryTitle.trim(),
        message: inquiryContent.trim(),
        appVersion: APP_VERSION,
      };
      if (userProfile?.nickname) {
        body.nickname = userProfile.nickname;
      }

      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSupportModalVisible(false);
        Alert.alert('접수 완료', '문의가 접수되었습니다. 감사합니다.');
      } else {
        Alert.alert('전송 실패', '전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      Alert.alert('전송 실패', '전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetTheme = () => {
    Alert.alert('테마 초기화', '테마를 라이트 모드로 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        onPress: async () => {
          await AsyncStorage.removeItem(THEME_STORAGE_KEY);
          await setTheme('light');
        },
      },
    ]);
  };

  const handleResetPlans = () => {
    Alert.alert(
      '모든 계획 기록을 초기화할까요?',
      '체크 기록과 날짜별 계획이 모두 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '초기화', style: 'destructive', onPress: () => resetPlans() },
      ],
    );
  };

  const handleAction = (label: string) => {
    Alert.alert('준비 중', `${label} 기능은 다음 업데이트에 포함될 예정입니다.`);
  };

  const SettingItem = ({
    icon,
    label,
    value,
    onPress,
    valueEmoji,
  }: {
    icon: any;
    label: string;
    value?: string;
    valueEmoji?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.textMain }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {valueEmoji ? (
          <Text style={styles.valueEmoji}>{valueEmoji}</Text>
        ) : null}
        {value ? (
          <Text style={[styles.itemValue, { color: colors.textSub }]}>{value}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={[styles.title, { color: colors.textMain }]}>설정</Text>

        {/* 테마 설정 */}
        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>테마 설정</Text>
        <View style={styles.themeGrid}>
          <ThemeOption
            mode="light"
            label="라이트"
            icon="sunny"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
          <ThemeOption
            mode="dark"
            label="다크"
            icon="moon"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
          <ThemeOption
            mode="pink"
            label="핑크"
            icon="color-palette"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
          <ThemeOption
            mode="blue"
            label="블루"
            icon="water"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
          <ThemeOption
            mode="green"
            label="그린"
            icon="leaf"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
          <ThemeOption
            mode="yellow"
            label="옐로우"
            icon="sunny-outline"
            currentTheme={theme}
            colors={colors}
            onPress={setTheme}
          />
        </View>
        <TouchableOpacity
          style={[styles.resetThemeButton, { borderColor: colors.border }]}
          onPress={handleResetTheme}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={15} color={colors.textSub} />
          <Text style={[styles.resetThemeText, { color: colors.textSub }]}>테마 초기화 (라이트 모드로)</Text>
        </TouchableOpacity>

        {/* 개인화 */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 28 }]}>개인화</Text>
        <SettingItem
          icon="person-outline"
          label="내 정보 수정"
          value={userProfile?.nickname}
          onPress={() => router.push({ pathname: '/onboarding', params: { edit: 'true' } })}
        />

        {/* 앱 설정 */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 28 }]}>앱 설정</Text>
        <SettingItem
          icon="notifications-outline"
          label="알림 설정"
          value={IS_EXPO_GO ? '배포 버전에서 활성화' : undefined}
          onPress={handleOpenNotifSettings}
        />
        <SettingItem
          icon="compass-outline"
          label="앱 사용법 다시 보기"
          onPress={async () => {
            await AsyncStorage.removeItem(TOUR_SEEN_KEY);
            router.navigate('/(tabs)');
            setTimeout(() => startTour(), 400);
          }}
        />
        <SettingItem
          icon="help-circle-outline"
          label="고객 지원"
          onPress={handleOpenSupport}
        />
        <SettingItem
          icon="document-text-outline"
          label="개인정보처리방침"
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        />

        {/* 데이터 관리 */}
        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 28 }]}>데이터 관리</Text>
        <TouchableOpacity
          style={[styles.dangerButton, { borderColor: '#FF3B30' + '40', backgroundColor: '#FF3B30' + '08' }]}
          onPress={handleResetPlans}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={[styles.dangerButtonText, { color: '#FF3B30' }]}>계획 초기화하기</Text>
        </TouchableOpacity>

        {/* 앱 정보 */}
        <View style={[styles.appInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.appInfoName, { color: colors.textMain }]}>근속일 계산기 · 일정 계획표</Text>
          <Text style={[styles.appInfoDesc, { color: colors.textSub }]}>근속일, 계획, 커리어 기록을 관리하는 앱</Text>
          <Text style={[styles.appInfoVersion, { color: colors.textSub }]}>버전 1.0.0</Text>
        </View>

      </ScrollView>

      {/* 알림 설정 모달 */}
      <Modal
        visible={notifModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>알림 설정</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textSub} />
              </TouchableOpacity>
            </View>

            {/* 권한 없음 배너 */}
            {permissionGranted === false && (
              <TouchableOpacity
                style={[styles.permissionBanner, { backgroundColor: '#FF3B3010', borderColor: '#FF3B3040' }]}
                onPress={handleRequestPermission}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle-outline" size={16} color="#FF3B30" />
                <Text style={[styles.permissionText, { color: '#FF3B30' }]}>
                  알림 권한이 없습니다. 탭해서 권한을 허용해주세요.
                </Text>
              </TouchableOpacity>
            )}

            {/* 오늘 계획 알림 */}
            <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.notifCardTop}>
                <Text style={[styles.notifCardLabel, { color: colors.textMain }]}>오늘 계획 알림</Text>
                <Switch
                  value={notifSettings.dailyPlanEnabled}
                  onValueChange={handleToggleDailyPlan}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.notifCardDesc, { color: colors.textSub }]}>
                매일 설정한 시간에 오늘 계획을 알려드려요.
              </Text>
              {notifSettings.dailyPlanEnabled && (
                <TouchableOpacity
                  style={[styles.notifTimeRow, { borderTopColor: colors.border }]}
                  onPress={() => setTimePickerFor('daily')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.notifTimeLabel, { color: colors.textSub }]}>알림 시간</Text>
                  <View style={styles.notifTimeRight}>
                    <Text style={[styles.notifTimeValue, { color: colors.primary }]}>
                      {fmtTime(notifSettings.dailyPlanHour, notifSettings.dailyPlanMinute)}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={colors.textSub} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 미완료 계획 알림 */}
            <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.notifCardTop}>
                <Text style={[styles.notifCardLabel, { color: colors.textMain }]}>미완료 계획 알림</Text>
                <Switch
                  value={notifSettings.incompleteEnabled}
                  onValueChange={handleToggleIncomplete}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <Text style={[styles.notifCardDesc, { color: colors.textSub }]}>
                완료하지 않은 계획이 있을 때만 알려드려요.
              </Text>
              {notifSettings.incompleteEnabled && (
                <TouchableOpacity
                  style={[styles.notifTimeRow, { borderTopColor: colors.border }]}
                  onPress={() => setTimePickerFor('incomplete')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.notifTimeLabel, { color: colors.textSub }]}>알림 시간</Text>
                  <View style={styles.notifTimeRight}>
                    <Text style={[styles.notifTimeValue, { color: colors.primary }]}>
                      {fmtTime(notifSettings.incompleteHour, notifSettings.incompleteMinute)}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={colors.textSub} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 입사 기념일 알림 */}
            <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.notifCardTop}>
                <Text style={[styles.notifCardLabel, { color: colors.textMain }]}>입사 기념일 알림</Text>
                <Switch
                  value={notifSettings.anniversaryEnabled && !!joinDate}
                  onValueChange={handleToggleAnniversary}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                  disabled={!joinDate}
                />
              </View>
              <Text style={[styles.notifCardDesc, { color: colors.textSub }]}>
                입사 100일, 1주년 같은 기념일을 알려드려요.
              </Text>
              {!joinDate && (
                <Text style={[styles.notifCardHint, { color: colors.textSub }]}>
                  홈 화면에서 입사일을 등록하면 활성화됩니다.
                </Text>
              )}
            </View>

          </View>
        </View>
      </Modal>

      {/* 시간 선택 피커 */}
      <DateTimePickerModal
        isVisible={timePickerFor !== null}
        mode="time"
        date={getPickerDate()}
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerFor(null)}
        is24Hour
      />

      {/* 고객 지원 모달 */}
      <Modal
        visible={supportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.background, borderColor: colors.border }]}>

            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>고객 지원</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.textSub} />
              </TouchableOpacity>
            </View>

            {/* 문의 유형 */}
            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>문의 유형</Text>
            <View style={styles.typeRow}>
              {(['버그 제보', '기능 제안', '기타 문의'] as InquiryType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: inquiryType === t ? colors.primary : colors.card,
                      borderColor: inquiryType === t ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setInquiryType(t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: inquiryType === t ? '#fff' : colors.textMain },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 제목 */}
            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>제목</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="제목을 입력하세요"
              placeholderTextColor={colors.textSub}
              value={inquiryTitle}
              onChangeText={setInquiryTitle}
              maxLength={100}
            />

            {/* 내용 */}
            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>내용</Text>
            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="문의 내용을 입력하세요"
              placeholderTextColor={colors.textSub}
              value={inquiryContent}
              onChangeText={setInquiryContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />

            {/* 보내기 버튼 */}
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary, opacity: isSending ? 0.6 : 1 }]}
              onPress={handleSendSupport}
              disabled={isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>보내기</Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 28 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', marginLeft: 4, marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  themeOption: {
    width: '31%', marginBottom: 8, padding: 14,
    borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  themeLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  resetThemeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 2, marginBottom: 4,
  },
  resetThemeText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  itemLabel: { fontSize: 15, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  valueEmoji: { fontSize: 16, marginRight: 4 },
  itemValue: { fontSize: 14, marginRight: 6 },
  dangerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 15, borderRadius: 18, borderWidth: 1.5, marginBottom: 4,
  },
  dangerButtonText: { fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: 16, fontSize: 12, fontWeight: '500' },

  // 고객 지원 모달
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeChipText: { fontSize: 13, fontWeight: '700' },
  titleInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
  },
  contentInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    height: 130,
    marginBottom: 20,
  },
  sendButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // 알림 설정 모달
  permissionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16,
  },
  permissionText: { fontSize: 13, fontWeight: '600', flex: 1 },
  notifCard: {
    borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
    marginBottom: 12,
  },
  notifCardTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  notifCardLabel: { fontSize: 15, fontWeight: '700' },
  notifCardDesc: { fontSize: 13, fontWeight: '400', lineHeight: 18, marginBottom: 10 },
  notifCardHint: { fontSize: 12, fontWeight: '500', marginBottom: 10, fontStyle: 'italic' },
  notifTimeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1, paddingVertical: 12,
  },
  notifTimeLabel: { fontSize: 13, fontWeight: '500' },
  notifTimeRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifTimeValue: { fontSize: 14, fontWeight: '700' },

  // 앱 정보 카드
  appInfoCard: {
    marginTop: 28,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfoName: { fontSize: 15, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  appInfoDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  appInfoVersion: { fontSize: 12, fontWeight: '600' },
});
