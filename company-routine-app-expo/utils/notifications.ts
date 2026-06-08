// expo-notifications 관련 코드는 프로덕션 빌드에서 활성화 예정
// Expo Go에서의 nullthrows/Metro 번들 오류를 방지하기 위해 임시 비활성화

import Constants from 'expo-constants';

export const NOTIF_SETTINGS_KEY = '@notification_settings';

export const IS_EXPO_GO = Constants.appOwnership === 'expo';

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

// 아래 함수들은 프로덕션 빌드에서 실제 구현으로 교체 예정
export const requestNotificationPermissions = async (): Promise<boolean> => false;
export const manageDailyPlanNotification = async (..._args: any[]) => {};
export const manageIncompleteNotification = async (..._args: any[]) => {};
export const manageAnniversaryNotifications = async (..._args: any[]) => {};
