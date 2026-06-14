import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const NOTIF_SETTINGS_KEY = '@notification_settings';
export const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

export interface NotifSettings {
  dailyPlanEnabled: boolean;
  dailyPlanHour: number;
  dailyPlanMinute: number;
  incompleteEnabled: boolean;
  incompleteHour: number;
  incompleteMinute: number;
  anniversaryEnabled: boolean;
}

export const DEFAULT_NOTIF_SETTINGS: NotifSettings = {
  dailyPlanEnabled: true,
  dailyPlanHour: 19,
  dailyPlanMinute: 0,
  incompleteEnabled: true,
  incompleteHour: 21,
  incompleteMinute: 0,
  anniversaryEnabled: true,
};

// Lazy-load expo-notifications — skip entirely in Expo Go
let Notifications: any = null;
if (!IS_EXPO_GO) {
  try {
    Notifications = require('expo-notifications');
  } catch {}
}

/** Call once at app startup to configure foreground display and Android channel */
export const setupNotifications = (): void => {
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: '기본 알림',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
};

/** Check permission without prompting */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

/** Request permission; returns true if granted */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

/** Schedule or cancel the daily plan reminder */
export const manageDailyPlanNotification = async (
  enabled: boolean,
  hour: number,
  minute: number,
): Promise<void> => {
  if (!Notifications) return;
  try { await Notifications.cancelScheduledNotificationAsync('daily-plan'); } catch {}
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-plan',
    content: {
      title: '📋 오늘의 계획',
      body: '오늘 계획을 확인하고 실천해보세요!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

/** Schedule or cancel the incomplete-plan evening reminder */
export const manageIncompleteNotification = async (
  enabled: boolean,
  hour: number,
  minute: number,
): Promise<void> => {
  if (!Notifications) return;
  try { await Notifications.cancelScheduledNotificationAsync('incomplete-plan'); } catch {}
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: 'incomplete-plan',
    content: {
      title: '⏰ 미완료 계획 알림',
      body: '아직 완료하지 못한 계획이 있어요!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

/** Schedule or cancel the yearly work-anniversary notification (09:00 on join date) */
export const manageAnniversaryNotifications = async (
  enabled: boolean,
  joinDateStr: string | null,
): Promise<void> => {
  if (!Notifications) return;
  try { await Notifications.cancelScheduledNotificationAsync('anniversary'); } catch {}
  if (!enabled || !joinDateStr) return;
  const d = new Date(joinDateStr + 'T00:00:00');
  await Notifications.scheduleNotificationAsync({
    identifier: 'anniversary',
    content: {
      title: '🎉 입사 기념일',
      body: '오늘은 입사 기념일이에요! 수고 많으셨습니다 👏',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: 9,
      minute: 0,
    },
  });
};
