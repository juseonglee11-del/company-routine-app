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
const CARD_WIDTH = (width - 60) / 2;

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
            차곡차곡 성장을 도와드릴게요.{'\n'}현재 직종을 선택해 주세요.
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
                  activeOpacity={0.85}
                  style={[
                    styles.jobCard,
                    {
                      backgroundColor: isSelected ? item.secondaryColor : colors.card,
                      borderColor: isSelected ? item.color : colors.border,
                      width: CARD_WIDTH,
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: item.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                  <View style={[styles.emojiContainer, { backgroundColor: isSelected ? '#fff' : item.secondaryColor }]}>
                    <Text style={styles.jobEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={[styles.jobLabel, { color: isSelected ? item.color : colors.textMain }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: selectedJob ? colors.primary : colors.border },
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  jobCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  jobEmoji: { fontSize: 36 },
  jobLabel: { fontSize: 15, fontWeight: '700' },
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
