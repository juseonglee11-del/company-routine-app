import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { format, addDays } from 'date-fns';
import { THEME_COLORS } from '@/constants/theme';
import { JOB_STORAGE_KEY, JOIN_DATE_KEY, JobType } from '@/constants/jobs';
import TourOverlay, { TOUR_STEP_COUNT, TOUR_SEEN_KEY } from '@/components/TourOverlay';
import {
  NotifSettings,
  DEFAULT_NOTIF_SETTINGS,
  NOTIF_SETTINGS_KEY,
  NOTIF_PERMISSION_ASKED_KEY,
  IS_EXPO_GO,
  setupNotifications,
  requestNotificationPermissions,
} from '@/utils/notifications';

const PinkTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF7EB6',
    background: '#FFF5FA',
    card: '#FFE4F1',
    text: '#4A4A4A',
    border: '#FFD1E8',
    notification: '#FF7EB6',
  },
};

const BlueTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    background: '#EFF6FF',
    card: '#DBEAFE',
    text: '#1E3A5F',
    border: '#BFDBFE',
    notification: '#3B82F6',
  },
};

const GreenTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#10B981',
    background: '#F0FDF4',
    card: '#DCFCE7',
    text: '#14532D',
    border: '#A7F3D0',
    notification: '#10B981',
  },
};

const YellowTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#F59E0B',
    background: '#FFFBEB',
    card: '#FEF9C3',
    text: '#4A3800',
    border: '#FDE68A',
    notification: '#F59E0B',
  },
};

const THEME_STORAGE_KEY = '@theme_preference';
const THEME_MIGRATION_KEY = '@theme_migrated_light_default_v1';
const ROUTINE_DATA_KEY = '@routine_completion_data';
const ROUTINE_LIST_KEY = '@routine_list_data';
const USER_PROFILE_KEY = '@user_profile';

type ThemeMode = 'light' | 'dark' | 'pink' | 'blue' | 'green' | 'yellow';

export interface UserProfile {
  name: string;
  nickname: string;
  gender: string;
  age: string;
  birthdate?: string;
}

export type RepeatType = 'daily' | 'weekday' | 'weekend' | 'custom';

export interface Routine {
  id: number;
  task: string;
  repeat: RepeatType;
  days?: number[];     // 0=일, 1=월…6=토 (custom 전용)
  startDate: string;   // yyyy-MM-dd, 이 날부터 활성
  endDate?: string;    // yyyy-MM-dd (exclusive), 이 날부터 완전 비활성
  skipDates?: string[];// 특정 날짜만 건너뜀 (해당 날 삭제 시 사용)
}

/** 특정 날짜에 루틴이 활성인지 판단 */
export const isRoutineActiveOnDate = (r: Routine, dateStr: string): boolean => {
  if (dateStr < r.startDate) return false;
  if (r.endDate && dateStr >= r.endDate) return false;
  if (r.skipDates?.includes(dateStr)) return false;
  const dow = new Date(dateStr + 'T00:00:00').getDay();
  if (r.repeat === 'weekday') return dow >= 1 && dow <= 5;
  if (r.repeat === 'weekend') return dow === 0 || dow === 6;
  if (r.repeat === 'custom')  return (r.days ?? []).includes(dow);
  return true; // 'daily'
};

const migrateRoutine = (r: any): Routine => ({
  id: r.id,
  task: r.task,
  repeat: r.repeat ?? 'daily',
  days: r.days,
  startDate: r.startDate ?? '2020-01-01',
  endDate: r.endDate,
  skipDates: r.skipDates,
});

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  colors: typeof THEME_COLORS.dark;

  userProfile: UserProfile | null;
  updateUserProfile: (profile: UserProfile) => Promise<void>;

  selectedJob: JobType | null;
  updateJob: (job: JobType) => Promise<void>;

  routines: Routine[];
  addRoutine: (task: string, repeat?: RepeatType, days?: number[], startDate?: string) => Promise<void>;
  addRoutinesBulk: (items: Array<{ task: string; repeat: RepeatType; days?: number[]; startDate: string; endDate?: string }>) => Promise<void>;
  deleteRoutine: (id: number, specificDate?: string) => Promise<void>;
  initDefaultRoutines: () => Promise<void>;

  completionData: { [key: string]: number[] };
  toggleRoutineCompletion: (date: string, id: number) => Promise<void>;
  resetPlans: () => Promise<void>;

  isLoaded: boolean;

  notifSettings: NotifSettings;
  updateNotifSettings: (partial: Partial<NotifSettings>) => Promise<void>;

  // ── Tour ──────────────────────────────────────────────────────────
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => Promise<void>;
  registerTourTarget: (key: string, ref: React.RefObject<View>) => void;
  getTourRef: (key: string) => React.RefObject<View> | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppTheme() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep splash screen visible while data loads from AsyncStorage
SplashScreen.preventAutoHideAsync();

// Configure notification handler and Android channel
setupNotifications();

// Initialize Google Mobile Ads once at startup (native Android builds only)
if (Platform.OS === 'android') {
  try {
    const mobileAds = require('react-native-google-mobile-ads').default;
    mobileAds().initialize().catch(() => {});
  } catch {}
}

const ONBOARDING_DEFAULT_ROUTINES = [
  '🏃 운동 30분',
  '📚 영어 공부 10분',
  '💧 물 2L 마시기',
  '😴 7시간 이상 수면',
];

export default function RootLayout() {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completionData, setCompletionData] = useState<{ [key: string]: number[] }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(DEFAULT_NOTIF_SETTINGS);

  // ── Tour state ────────────────────────────────────────────────────
  const [tourStep, setTourStep] = useState(-1);
  const tourRefs = useRef<Record<string, React.RefObject<View>>>({});

  const startTour = () => setTourStep(0);
  const nextTourStep = () =>
    setTourStep(s => (s + 1 <= TOUR_STEP_COUNT ? s + 1 : s));
  const prevTourStep = () =>
    setTourStep(s => (s - 1 >= 0 ? s - 1 : 0));
  const endTour = async () => {
    setTourStep(-1);
    await AsyncStorage.setItem(TOUR_SEEN_KEY, 'true');
  };
  const registerTourTarget = (key: string, ref: React.RefObject<View>) => {
    tourRefs.current[key] = ref;
  };
  const getTourRef = (key: string) => tourRefs.current[key];

  useEffect(() => {
    loadAllData();
  }, []);

  // 앱 최초 실행 시 알림 권한 1회 자동 요청 (Expo Go 제외)
  useEffect(() => {
    if (!isLoaded || IS_EXPO_GO) return;
    (async () => {
      try {
        const asked = await AsyncStorage.getItem(NOTIF_PERMISSION_ASKED_KEY);
        if (asked) return;
        await AsyncStorage.setItem(NOTIF_PERMISSION_ASKED_KEY, 'true');
        await requestNotificationPermissions();
      } catch {}
    })();
  }, [isLoaded]);

  const loadAllData = async () => {
    try {
      const [savedTheme, savedJob, savedRoutines, savedCompletion, savedProfile, isMigrated, savedNotifSettings] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(JOB_STORAGE_KEY),
        AsyncStorage.getItem(ROUTINE_LIST_KEY),
        AsyncStorage.getItem(ROUTINE_DATA_KEY),
        AsyncStorage.getItem(USER_PROFILE_KEY),
        AsyncStorage.getItem(THEME_MIGRATION_KEY),
        AsyncStorage.getItem(NOTIF_SETTINGS_KEY),
      ]);

      const validThemes: ThemeMode[] = ['light', 'dark', 'pink', 'blue', 'green', 'yellow'];
      if (!isMigrated && savedTheme === 'pink') {
        await AsyncStorage.multiSet([[THEME_STORAGE_KEY, 'light'], [THEME_MIGRATION_KEY, 'true']]);
        setThemeState('light');
      } else if (savedTheme && validThemes.includes(savedTheme as ThemeMode)) {
        setThemeState(savedTheme as ThemeMode);
      } else if (!isMigrated) {
        await AsyncStorage.setItem(THEME_MIGRATION_KEY, 'true');
      }
      if (savedJob) setSelectedJob(savedJob as JobType);
      if (savedRoutines) setRoutines((JSON.parse(savedRoutines) as any[]).map(migrateRoutine));
      if (savedCompletion) setCompletionData(JSON.parse(savedCompletion));
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      if (savedNotifSettings) setNotifSettings({ ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(savedNotifSettings) });
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoaded(true);
      SplashScreen.hideAsync();
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = async () => {
    const cycle: ThemeMode[] = ['light', 'dark', 'pink', 'blue', 'green', 'yellow'];
    const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
    await setTheme(next);
  };

  const updateUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  };

  const updateJob = async (job: JobType) => {
    setSelectedJob(job);
    await AsyncStorage.setItem(JOB_STORAGE_KEY, job);
  };

  const addRoutine = async (task: string, repeat: RepeatType = 'daily', days?: number[], startDate?: string) => {
    const effectiveStart = startDate ?? format(new Date(), 'yyyy-MM-dd');
    const newId = Date.now();
    const newRoutine: Routine = { id: newId, task, repeat, startDate: effectiveStart, ...(days ? { days } : {}) };
    const nextRoutines = [...routines, newRoutine];
    setRoutines(nextRoutines);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(nextRoutines));
  };

  const addRoutinesBulk = async (
    items: Array<{ task: string; repeat: RepeatType; days?: number[]; startDate: string; endDate?: string }>,
  ) => {
    const now = Date.now();
    const newRoutines: Routine[] = items.map((item, i) => ({
      id: now + i,
      task: item.task,
      repeat: item.repeat,
      startDate: item.startDate,
      ...(item.days ? { days: item.days } : {}),
      ...(item.endDate ? { endDate: item.endDate } : {}),
    }));
    const nextRoutines = [...routines, ...newRoutines];
    setRoutines(nextRoutines);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(nextRoutines));
  };

  const deleteRoutine = async (id: number, specificDate?: string) => {
    let nextRoutines: Routine[];
    if (specificDate) {
      // 해당 날짜만 건너뜀 — 다른 날짜에는 영향 없음
      nextRoutines = routines.map(r =>
        r.id === id
          ? { ...r, skipDates: [...(r.skipDates ?? []), specificDate] }
          : r
      );
    } else {
      // 전체 삭제 (내일부터 완전 비활성)
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      nextRoutines = routines.map(r => r.id === id ? { ...r, endDate: tomorrow } : r);
    }
    setRoutines(nextRoutines);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(nextRoutines));
  };

  const initDefaultRoutines = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const now = Date.now();
    const defaults: Routine[] = ONBOARDING_DEFAULT_ROUTINES.map((task, i) => ({
      id: now + i,
      task,
      repeat: 'daily' as RepeatType,
      startDate: today,
      endDate: tomorrow,
    }));
    setRoutines(defaults);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(defaults));
  };

  const updateNotifSettings = async (partial: Partial<NotifSettings>) => {
    const next = { ...notifSettings, ...partial };
    setNotifSettings(next);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(next));
  };

  const resetPlans = async () => {
    setRoutines([]);
    setCompletionData({});
    await AsyncStorage.multiRemove([ROUTINE_LIST_KEY, ROUTINE_DATA_KEY]);
  };

  const toggleRoutineCompletion = async (date: string, id: number) => {
    const currentCompleted = completionData[date] || [];
    let newCompleted;
    if (currentCompleted.includes(id)) {
      newCompleted = currentCompleted.filter(item => item !== id);
    } else {
      newCompleted = [...currentCompleted, id];
    }
    const nextCompletionData = { ...completionData, [date]: newCompleted };
    setCompletionData(nextCompletionData);
    await AsyncStorage.setItem(ROUTINE_DATA_KEY, JSON.stringify(nextCompletionData));
  };

  const colors = THEME_COLORS[theme];

  const navTheme =
    theme === 'dark' ? DarkTheme :
    theme === 'pink' ? PinkTheme :
    theme === 'blue' ? BlueTheme :
    theme === 'green' ? GreenTheme :
    theme === 'yellow' ? YellowTheme :
    DefaultTheme;

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={{
        theme,
        toggleTheme,
        setTheme,
        colors,
        userProfile,
        updateUserProfile,
        selectedJob,
        updateJob,
        routines,
        addRoutine,
        addRoutinesBulk,
        deleteRoutine,
        initDefaultRoutines,
        completionData,
        toggleRoutineCompletion,
        resetPlans,
        isLoaded,
        notifSettings,
        updateNotifSettings,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        registerTourTarget,
        getTourRef,
      }}>
        <NavigationProvider value={navTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="+not-found" options={{ title: '페이지 없음' }} />
          </Stack>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationProvider>
        <TourOverlay />
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
