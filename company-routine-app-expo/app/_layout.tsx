import React, { createContext, useContext, useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationProvider, Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { THEME_COLORS } from '@/constants/theme';
import { JOB_STORAGE_KEY, JobType } from '@/constants/jobs';

const PinkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF7EB6',
    background: '#FFF5FA',
    card: '#FFE4F1',
    text: '#4A4A4A',
    border: '#FFD1E8',
    notification: '#FF7EB6',
  },
};

const THEME_STORAGE_KEY = '@theme_preference';
const ROUTINE_DATA_KEY = '@routine_completion_data';
const ROUTINE_LIST_KEY = '@routine_list_data';

type ThemeMode = 'light' | 'dark' | 'pink';

interface Routine {
  id: number;
  task: string;
}

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  colors: typeof THEME_COLORS.dark;
  
  // Data
  selectedJob: JobType | null;
  updateJob: (job: JobType) => Promise<void>;
  
  routines: Routine[];
  addRoutine: (task: string) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  
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

const DEFAULT_ROUTINES: Routine[] = [
  { id: 1, task: '출근 체크 및 메일 확인' },
  { id: 2, task: '오늘의 할 일 우선순위 설정' },
  { id: 3, task: '오전 집중 업무 시간' },
  { id: 4, task: '팀 미팅 및 커뮤니케이션' },
];

export default function RootLayout() {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [completionData, setCompletionData] = useState<{ [key: string]: number[] }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [savedTheme, savedJob, savedRoutines, savedCompletion] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(JOB_STORAGE_KEY),
        AsyncStorage.getItem(ROUTINE_LIST_KEY),
        AsyncStorage.getItem(ROUTINE_DATA_KEY),
      ]);

      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'pink') {
        setThemeState(savedTheme as ThemeMode);
      }
      if (savedJob) setSelectedJob(savedJob as JobType);
      if (savedRoutines) setRoutines(JSON.parse(savedRoutines));
      if (savedCompletion) setCompletionData(JSON.parse(savedCompletion));
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
    let newTheme: ThemeMode = 'light';
    if (theme === 'light') newTheme = 'dark';
    else if (theme === 'dark') newTheme = 'pink';
    else if (theme === 'pink') newTheme = 'light';
    
    await setTheme(newTheme);
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

  const navTheme = theme === 'light' ? DefaultTheme : theme === 'pink' ? PinkTheme : DarkTheme;

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={{
        theme,
        toggleTheme,
        setTheme,
        colors,
        selectedJob,
        updateJob,
        routines,
        addRoutine,
        deleteRoutine,
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
          <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
        </NavigationProvider>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
