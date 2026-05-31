import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { JOB_CHARACTERS, JobType } from '@/constants/jobs';
import { useAppTheme } from './_layout';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { colors, updateJob } = useAppTheme();
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);

  const handleComplete = async () => {
    if (selectedJob) {
      try {
        await updateJob(selectedJob);
        router.replace('/(tabs)');
      } catch (e) {
        console.error('Failed to save job preference', e);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textMain }]}>환영합니다! ✨</Text>
          <Text style={[styles.subtitle, { color: colors.textSub }]}>
            당신의 성장을 관리해 드릴게요.{"\n"}현재 직종을 선택해 주세요.
          </Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {(Object.keys(JOB_CHARACTERS) as JobType[]).map((key) => {
              const item = JOB_CHARACTERS[key];
              const isSelected = selectedJob === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedJob(key)}
                  style={[
                    styles.jobCard,
                    { 
                      backgroundColor: isSelected ? item.color + '20' : colors.card, 
                      borderColor: isSelected ? item.color : colors.border,
                      width: (width - 60) / 2
                    }
                  ]}
                >
                  <View style={[styles.emojiContainer, { backgroundColor: isSelected ? '#fff' : colors.background + '50' }]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View>
                  <Text style={[styles.jobLabel, { color: isSelected ? item.color : colors.textMain }]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: item.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: selectedJob ? colors.primary : colors.border }
            ]}
            onPress={handleComplete}
            disabled={!selectedJob}
          >
            <Text style={styles.buttonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  jobCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: { fontSize: 32 },
  jobLabel: { fontSize: 15, fontWeight: '700' },
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
