import React, { createContext, useContext, useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { THEME_COLORS } from '@/constants/theme';
import { JOB_STORAGE_KEY, JOIN_DATE_KEY, JobType } from '@/constants/jobs';

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
  birthdate?: string; // ISO string, optional for backward compat
}

interface Routine {
  id: number;
  task: string;
}

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
  addRoutine: (task: string) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  initDefaultRoutines: () => Promise<void>;

  completionData: { [key: string]: number[] };
  toggleRoutineCompletion: (date: string, id: number) => Promise<void>;

  isLoaded: boolean;
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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // DEV ONLY: clear user data on every launch for onboarding testing
      await AsyncStorage.multiRemove([JOB_STORAGE_KEY, USER_PROFILE_KEY, ROUTINE_LIST_KEY, ROUTINE_DATA_KEY, JOIN_DATE_KEY]);

      const [savedTheme, savedJob, savedRoutines, savedCompletion, savedProfile, isMigrated] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(JOB_STORAGE_KEY),
        AsyncStorage.getItem(ROUTINE_LIST_KEY),
        AsyncStorage.getItem(ROUTINE_DATA_KEY),
        AsyncStorage.getItem(USER_PROFILE_KEY),
        AsyncStorage.getItem(THEME_MIGRATION_KEY),
      ]);

      const validThemes: ThemeMode[] = ['light', 'dark', 'pink', 'blue', 'green', 'yellow'];
      if (!isMigrated && savedTheme === 'pink') {
        // One-time migration: pink was the old default, reset to light
        await AsyncStorage.multiSet([[THEME_STORAGE_KEY, 'light'], [THEME_MIGRATION_KEY, 'true']]);
        setThemeState('light');
      } else if (savedTheme && validThemes.includes(savedTheme as ThemeMode)) {
        setThemeState(savedTheme as ThemeMode);
      } else if (!isMigrated) {
        // First launch: mark migration done so we never override user's choice again
        await AsyncStorage.setItem(THEME_MIGRATION_KEY, 'true');
      }
      if (savedJob) setSelectedJob(savedJob as JobType);
      if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
      if (savedCompletion) setCompletionData(JSON.parse(savedCompletion));
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoaded(true);
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

  const addRoutine = async (task: string) => {
    const newId = Date.now();
    const nextRoutines = [...routines, { id: newId, task }];
    setRoutines(nextRoutines);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(nextRoutines));
  };

  const deleteRoutine = async (id: number) => {
    const nextRoutines = routines.filter(r => r.id !== id);
    setRoutines(nextRoutines);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(nextRoutines));
  };

  const initDefaultRoutines = async () => {
    const now = Date.now();
    const defaults: Routine[] = ONBOARDING_DEFAULT_ROUTINES.map((task, i) => ({
      id: now + i,
      task,
    }));
    setRoutines(defaults);
    await AsyncStorage.setItem(ROUTINE_LIST_KEY, JSON.stringify(defaults));
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
        deleteRoutine,
        initDefaultRoutines,
        completionData,
        toggleRoutineCompletion,
        isLoaded
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
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
