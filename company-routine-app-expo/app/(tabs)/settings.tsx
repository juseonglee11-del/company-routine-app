import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../_layout';

import { JOB_CHARACTERS } from '@/constants/jobs';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, selectedJob } = useAppTheme();
  const router = useRouter();

  const handleAction = (label: string) => {
    Alert.alert('준비 중', `${label} 기능은 다음 업데이트에 포함될 예정입니다.`);
  };

  const handleReselectJob = () => {
    Alert.alert('직종 다시 선택', '직종 선택 화면으로 이동하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '이동', onPress: () => router.push('/onboarding') }
    ]);
  };

  const currentJobLabel = selectedJob ? JOB_CHARACTERS[selectedJob].label : '미설정';

  const SettingItem = ({ icon, label, value, type = 'arrow', onPress }: any) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={type === 'switch' ? undefined : onPress}
      activeOpacity={type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.textMain }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {type === 'switch' ? (
          <Switch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
          />
        ) : (
          <>
            {value && <Text style={[styles.itemValue, { color: colors.textSub }]}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color={colors.textSub} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.title, { color: colors.textMain }]}>설정</Text>

        <Text style={[styles.sectionTitle, { color: colors.textSub }]}>개인화</Text>
        <SettingItem 
          icon={theme === 'dark' ? "moon" : "sunny"} 
          label="다크 모드" 
          type="switch" 
        />
        <SettingItem 
          icon="person-outline" 
          label="프로필 정보" 
          value="개발자 이주성"
          onPress={() => handleAction('프로필 정보 수정')}
        />
        <SettingItem 
          icon="construct-outline" 
          label="나의 직종 관리" 
          value={currentJobLabel}
          onPress={() => handleAction('직종 관리')}
        />
        <SettingItem 
          icon="refresh-outline" 
          label="직종 다시 선택" 
          onPress={handleReselectJob}
        />

        <Text style={[styles.sectionTitle, { color: colors.textSub, marginTop: 30 }]}>앱 설정</Text>
        <SettingItem 
          icon="notifications-outline" 
          label="알림 설정" 
          onPress={() => handleAction('알림 설정')}
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

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '확인', onPress: () => handleAction('로그아웃 완료') }
          ])}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSub }]}>Version 1.0.0 (Build 12)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 }, // Fix for Android/iOS overlap
  title: { fontSize: 24, fontWeight: '800', marginBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginLeft: 4, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 18, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemLabel: { fontSize: 15, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { fontSize: 14, marginRight: 8 },
  logoutButton: { marginTop: 40, alignItems: 'center', padding: 15 },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', marginTop: 20, fontSize: 12, fontWeight: '500' },
});
