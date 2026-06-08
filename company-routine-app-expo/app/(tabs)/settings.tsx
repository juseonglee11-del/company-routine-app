import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../_layout';
import { TOUR_SEEN_KEY } from '@/components/TourOverlay';

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
  const { theme, setTheme, colors, userProfile, startTour, resetPlans } = useAppTheme();
  const router = useRouter();

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
          value="배포 버전에서 활성화"
          onPress={() => Alert.alert('알림', '알림 기능은 배포 버전에서 활성화됩니다.')}
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
          icon="shield-checkmark-outline"
          label="데이터 백업 및 복원"
          onPress={() => handleAction('데이터 백업')}
        />
        <SettingItem
          icon="help-circle-outline"
          label="고객 지원"
          onPress={() => handleAction('고객 지원')}
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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              { text: '확인', onPress: () => handleAction('로그아웃 완료') },
            ])
          }
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSub }]}>차곡차곡 v1.0.0</Text>

      </ScrollView>
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
  logoutButton: { marginTop: 28, alignItems: 'center', padding: 15 },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: 16, fontSize: 12, fontWeight: '500' },
});
