import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { useAppTheme } from '../_layout';

interface CareerEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string; // 'Present' or ISO date
  achievements: string;
}

export default function CareerScreen() {
  const { colors } = useAppTheme();
  const [entries, setEntries] = useState<CareerEntry[]>([
    {
      id: '1',
      company: '테크 코퍼레이션',
      role: '시니어 개발자',
      startDate: '2022-03-01',
      endDate: '2023-12-31',
      achievements: '매출 20% 향상 기여, 시스템 아키텍처 개선',
    },
    {
      id: '2',
      company: '현재 회사',
      role: '리드 엔지니어',
      startDate: '2024-01-01',
      endDate: 'Present',
      achievements: '신규 프로젝트 리딩, 팀 생산성 30% 개선',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<CareerEntry>>({});

  const totalCareerMonths = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const start = parseISO(entry.startDate);
      const end = entry.endDate === 'Present' ? new Date() : parseISO(entry.endDate);
      return acc + differenceInMonths(end, start) + 1;
    }, 0);
  }, [entries]);

  const totalCareerStr = useMemo(() => {
    const years = Math.floor(totalCareerMonths / 12);
    const months = totalCareerMonths % 12;
    if (years === 0) return `${months}개월`;
    return `${years}년 ${months}개월`;
  }, [totalCareerMonths]);

  const handleAddEntry = () => {
    if (newEntry.company && newEntry.role && newEntry.startDate) {
      const entry: CareerEntry = {
        id: Date.now().toString(),
        company: newEntry.company,
        role: newEntry.role,
        startDate: newEntry.startDate,
        endDate: newEntry.endDate || 'Present',
        achievements: newEntry.achievements || '',
      };
      setEntries([entry, ...entries]);
      setModalVisible(false);
      setNewEntry({});
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textMain }]}>커리어 이력</Text>
          <View style={[styles.totalBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.totalLabel, { color: colors.textSub }]}>총 경력</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{totalCareerStr}</Text>
          </View>
        </View>

        {entries.map((entry) => (
          <View key={entry.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.companyName, { color: colors.textMain }]}>{entry.company}</Text>
                <Text style={[styles.roleName, { color: colors.textSub }]}>{entry.role}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.textSub} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.periodRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.periodText, { color: colors.textSub }]}>
                {entry.startDate} ~ {entry.endDate === 'Present' ? '재직 중' : entry.endDate}
              </Text>
            </View>

            <View style={[styles.achievementBox, { backgroundColor: colors.background + '50' }]}>
              <Text style={[styles.achievementTitle, { color: colors.textMain }]}>주요 성과</Text>
              <Text style={[styles.achievementText, { color: colors.textSub }]}>{entry.achievements}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>이력 추가하기</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>경력 추가</Text>
            
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder="회사명"
              placeholderTextColor={colors.textSub}
              onChangeText={(val) => setNewEntry({...newEntry, company: val})}
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder="담당 업무 / 직무"
              placeholderTextColor={colors.textSub}
              onChangeText={(val) => setNewEntry({...newEntry, role: val})}
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder="입사일 (YYYY-MM-DD)"
              placeholderTextColor={colors.textSub}
              onChangeText={(val) => setNewEntry({...newEntry, startDate: val})}
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border }]}
              placeholder="퇴사일 (재직중이면 비워두세요)"
              placeholderTextColor={colors.textSub}
              onChangeText={(val) => setNewEntry({...newEntry, endDate: val})}
            />
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.textMain, borderColor: colors.border, height: 80 }]}
              placeholder="성과 기록"
              placeholderTextColor={colors.textSub}
              multiline
              onChangeText={(val) => setNewEntry({...newEntry, achievements: val})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.textSub }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleAddEntry}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800' },
  totalBadge: { padding: 10, borderRadius: 15, alignItems: 'center' },
  totalLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  totalValue: { fontSize: 16, fontWeight: '800' },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  companyName: { fontSize: 18, fontWeight: '700' },
  roleName: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  periodRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  periodText: { fontSize: 13, fontWeight: '500' },
  achievementBox: { padding: 12, borderRadius: 12 },
  achievementTitle: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  achievementText: { fontSize: 13, lineHeight: 18 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 15, marginTop: 10 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelButton: { padding: 12, marginRight: 10 },
  saveButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
