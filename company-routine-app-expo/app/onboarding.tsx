import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { JOB_CHARACTERS, JOB_CATEGORIES, JobType } from '@/constants/jobs';
import { useAppTheme, UserProfile } from './_layout';

const DEFAULT_PICKER_DATE = new Date();

const calcAge = (date: Date): string => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return String(age);
};

const formatBirthdate = (date: Date): string => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${mo}.${d}`;
};

const GenderCard = ({
  label, iconName, accentColor, selected, textColor, onPress,
}: {
  label: string; iconName: 'female' | 'male'; accentColor: string;
  selected: boolean; textColor: string; onPress: () => void;
}) => (
  <TouchableOpacity
    style={[
      styles.genderCard,
      {
        backgroundColor: selected ? accentColor + '22' : accentColor + '0F',
        borderColor: selected ? accentColor : accentColor + '55',
        borderWidth: selected ? 2.5 : 1.5,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {selected && (
      <View style={[styles.genderCheckCircle, { backgroundColor: accentColor }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    )}
    <View style={[styles.genderIconCircle, { backgroundColor: accentColor + '1A' }]}>
      <Ionicons name={iconName} size={46} color={accentColor} />
    </View>
    <Text style={[styles.genderCardLabel, { color: selected ? accentColor : textColor }]}>{label}</Text>
  </TouchableOpacity>
);

export default function OnboardingScreen() {
  const { colors, updateJob, updateUserProfile, initDefaultRoutines, userProfile, selectedJob } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = params.edit === 'true';

  const [name, setName] = useState(userProfile?.name ?? '');
  const [nickname, setNickname] = useState(userProfile?.nickname ?? '');
  const [gender, setGender] = useState(userProfile?.gender ?? '');
  const [birthdate, setBirthdate] = useState<Date | null>(
    userProfile?.birthdate ? new Date(userProfile.birthdate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedJobLocal, setSelectedJobLocal] = useState<JobType | null>(
    selectedJob && JOB_CHARACTERS[selectedJob] ? selectedJob : null
  );
  const [step, setStep] = useState(0);
  const [templateChoice, setTemplateChoice] = useState<'template' | 'empty' | null>(null);

  // Job picker state (shared between step 2 and edit mode)
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  const canProceedStep0 = name.trim().length > 0 && nickname.trim().length > 0;
  const canProceedStep1 = gender.length > 0 && birthdate !== null;
  const canComplete = selectedJobLocal !== null;
  const canCompleteStep3 = templateChoice !== null;

  const handleConfirmDate = (date: Date) => {
    setBirthdate(date);
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!selectedJobLocal || !birthdate) return;
    const profile: UserProfile = {
      name: name.trim(),
      nickname: nickname.trim(),
      gender,
      age: calcAge(birthdate),
      birthdate: birthdate.toISOString(),
    };
    await updateUserProfile(profile);
    await updateJob(selectedJobLocal);
    if (isEditMode) {
      router.back();
    } else {
      if (templateChoice === 'template') {
        await initDefaultRoutines();
      }
      router.replace({ pathname: '/(tabs)', params: { welcome: '1' } });
    }
  };

  // ── Job Picker helpers ──────────────────────────────────────────
  const renderJobRow = (key: JobType) => {
    const item = JOB_CHARACTERS[key];
    if (!item) return null;
    const isSelected = selectedJobLocal === key;
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.jobRow,
          {
            backgroundColor: isSelected ? item.secondaryColor : colors.card,
            borderColor: isSelected ? item.color : colors.border,
          },
        ]}
        onPress={() => setSelectedJobLocal(key)}
        activeOpacity={0.8}
      >
        <View style={[styles.jobRowIcon, { backgroundColor: isSelected ? '#fff' : item.secondaryColor }]}>
          <Text style={styles.jobRowEmoji}>{item.emoji}</Text>
        </View>
        <Text style={[styles.jobRowLabel, { color: isSelected ? item.color : colors.textMain }]}>
          {item.label}
        </Text>
        {isSelected && <Ionicons name="checkmark-circle" size={20} color={item.color} />}
      </TouchableOpacity>
    );
  };

  const renderJobPicker = () => {
    const trimmed = jobSearchQuery.trim().toLowerCase();
    const isSearching = trimmed.length > 0;
    const currentCategory = selectedCategoryKey
      ? JOB_CATEGORIES.find(c => c.key === selectedCategoryKey)
      : null;
    const filteredKeys: JobType[] = isSearching
      ? (Object.keys(JOB_CHARACTERS) as JobType[]).filter(k =>
          JOB_CHARACTERS[k].label.toLowerCase().includes(trimmed)
        )
      : [];

    return (
      <View>
        {/* 검색바 */}
        <View style={[styles.jobSearchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSub} />
          <TextInput
            style={[styles.jobSearchInput, { color: colors.textMain }]}
            placeholder="직업을 검색하세요"
            placeholderTextColor={colors.textSub}
            value={jobSearchQuery}
            onChangeText={text => {
              setJobSearchQuery(text);
              if (text.length > 0) setSelectedCategoryKey(null);
            }}
          />
          {jobSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setJobSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          // 검색 결과
          <View style={{ marginTop: 6 }}>
            {filteredKeys.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSub }]}>검색 결과가 없습니다</Text>
            ) : (
              filteredKeys.map(renderJobRow)
            )}
          </View>
        ) : currentCategory ? (
          // 소분류 목록
          <View style={{ marginTop: 6 }}>
            <TouchableOpacity
              style={[styles.categoryBackBtn, { borderColor: colors.border }]}
              onPress={() => setSelectedCategoryKey(null)}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
              <Text style={[styles.categoryBackText, { color: colors.primary }]}>
                {currentCategory.emoji} {currentCategory.label}
              </Text>
            </TouchableOpacity>
            {currentCategory.jobKeys.map(renderJobRow)}
          </View>
        ) : (
          // 대분류 그리드
          <View style={styles.categoryGrid}>
            {JOB_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSelectedCategoryKey(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: colors.textMain }]}>{cat.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const BirthdateField = ({ marginTop = 0 }: { marginTop?: number }) => (
    <>
      <Text style={[styles.fieldLabel, { color: colors.textSub, marginTop }]}>생년월일</Text>
      <TouchableOpacity
        style={[
          styles.datePickerBtn,
          { backgroundColor: colors.card, borderColor: birthdate ? colors.primary : colors.border },
        ]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={20} color={birthdate ? colors.primary : colors.textSub} />
        <Text style={[styles.datePickerText, { color: birthdate ? colors.textMain : colors.textSub }]}>
          {birthdate ? formatBirthdate(birthdate) : '생년월일을 선택하세요'}
        </Text>
        {birthdate && (
          <View style={[styles.ageBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.ageBadgeText, { color: colors.primary }]}>{calcAge(birthdate)}세</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );

  // ── 수정 모드 ───────────────────────────────────────────────────
  if (isEditMode) {
    const allFilled = name.trim() && nickname.trim() && gender && birthdate && selectedJobLocal;
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.editScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.editHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.textMain} />
              </TouchableOpacity>
              <Text style={[styles.editTitle, { color: colors.textMain }]}>내 정보 수정</Text>
              <View style={{ width: 34 }} />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>이름</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="이름을 입력하세요"
              placeholderTextColor={colors.textSub}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSub, marginTop: 20 }]}>닉네임</Text>
            <Text style={[styles.fieldHint, { color: colors.textSub }]}>홈 화면 상단에 표시됩니다</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="사용할 닉네임을 입력해주세요"
              placeholderTextColor={colors.textSub}
              value={nickname}
              onChangeText={setNickname}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSub, marginTop: 20 }]}>성별</Text>
            <View style={styles.genderCardRow}>
              <GenderCard label="여성" iconName="female" accentColor="#FF7EB6" selected={gender === 'female'} textColor={colors.textMain} onPress={() => setGender('female')} />
              <GenderCard label="남성" iconName="male" accentColor="#3B82F6" selected={gender === 'male'} textColor={colors.textMain} onPress={() => setGender('male')} />
            </View>

            <BirthdateField marginTop={20} />

            <Text style={[styles.fieldLabel, { color: colors.textSub, marginTop: 28 }]}>직종 선택</Text>
            {renderJobPicker()}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: allFilled ? colors.primary : colors.border, marginTop: 28 }]}
              onPress={handleSave}
              disabled={!allFilled}
            >
              <Text style={styles.saveBtnText}>저장하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setShowDatePicker(false)}
          date={birthdate ?? DEFAULT_PICKER_DATE}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
        />
      </SafeAreaView>
    );
  }

  // ── 최초 온보딩: 3단계 마법사 ────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* 진행 인디케이터 */}
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= step ? colors.primary : colors.border },
                i === step && { width: 24 },
              ]}
            />
          ))}
        </View>

        {/* Step 0: 이름 & 닉네임 */}
        {step === 0 && (
          <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: colors.textMain }]}>반가워요 👋</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSub }]}>먼저 당신을 소개해주세요.</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>이름</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="이름을 입력하세요"
              placeholderTextColor={colors.textSub}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { color: colors.textSub, marginTop: 24 }]}>닉네임</Text>
            <Text style={[styles.fieldHint, { color: colors.textSub }]}>홈 화면 상단에 표시됩니다</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textMain }]}
              placeholder="사용할 닉네임을 입력해주세요"
              placeholderTextColor={colors.textSub}
              value={nickname}
              onChangeText={setNickname}
            />
          </ScrollView>
        )}

        {/* Step 1: 성별 & 생년월일 */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: colors.textMain }]}>반갑습니다, {name}님! ✨</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSub }]}>
              조금 더 알려주시면{'\n'}맞춤 경험을 제공할게요.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>성별</Text>
            <View style={styles.genderCardRow}>
              <GenderCard label="여성" iconName="female" accentColor="#FF7EB6" selected={gender === 'female'} textColor={colors.textMain} onPress={() => setGender('female')} />
              <GenderCard label="남성" iconName="male" accentColor="#3B82F6" selected={gender === 'male'} textColor={colors.textMain} onPress={() => setGender('male')} />
            </View>

            <BirthdateField marginTop={24} />
          </ScrollView>
        )}

        {/* Step 2: 직종 선택 */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.stepTitle, { color: colors.textMain }]}>어떤 일을 하시나요? 💼</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSub }]}>직종에 맞는 루틴을 제안해드릴게요.</Text>
            {renderJobPicker()}
          </ScrollView>
        )}

        {/* Step 3: 시작 방식 선택 */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.stepTitle, { color: colors.textMain }]}>어떻게 시작할까요? 🚀</Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSub }]}>시작 방식을 선택해주세요.</Text>

            {/* 직장인 기본 템플릿 */}
            <TouchableOpacity
              style={[
                styles.templateCard,
                {
                  backgroundColor: templateChoice === 'template' ? colors.primary + '18' : colors.card,
                  borderColor: templateChoice === 'template' ? colors.primary : colors.border,
                  borderWidth: templateChoice === 'template' ? 2.5 : 1.5,
                },
              ]}
              onPress={() => setTemplateChoice('template')}
              activeOpacity={0.8}
            >
              {templateChoice === 'template' && (
                <View style={[styles.templateCheck, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <Text style={[styles.templateTitle, { color: templateChoice === 'template' ? colors.primary : colors.textMain }]}>
                직장인 기본 템플릿
              </Text>
              <Text style={[styles.templateDesc, { color: colors.textSub }]}>오늘 하루 4가지 기본 계획이 생성돼요</Text>
              <View style={styles.templateItems}>
                {['🏃 운동 30분', '📚 영어 공부 10분', '💧 물 2L 마시기', '😴 7시간 이상 수면'].map(item => (
                  <View key={item} style={styles.templateItem}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.textSub} />
                    <Text style={[styles.templateItemText, { color: colors.textSub }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            {/* 빈 상태로 시작 */}
            <TouchableOpacity
              style={[
                styles.templateCard,
                {
                  backgroundColor: templateChoice === 'empty' ? colors.primary + '18' : colors.card,
                  borderColor: templateChoice === 'empty' ? colors.primary : colors.border,
                  borderWidth: templateChoice === 'empty' ? 2.5 : 1.5,
                  marginTop: 14,
                },
              ]}
              onPress={() => setTemplateChoice('empty')}
              activeOpacity={0.8}
            >
              {templateChoice === 'empty' && (
                <View style={[styles.templateCheck, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
              <Text style={[styles.templateTitle, { color: templateChoice === 'empty' ? colors.primary : colors.textMain }]}>
                빈 상태로 시작
              </Text>
              <Text style={[styles.templateDesc, { color: colors.textSub }]}>아무 계획도 생성하지 않아요</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* 하단 내비게이션 */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          {step > 0 && (
            <TouchableOpacity
              style={[styles.backStepBtn, { borderColor: colors.border }]}
              onPress={() => {
                if (step === 2 && selectedCategoryKey) {
                  setSelectedCategoryKey(null);
                } else {
                  setStep(step - 1);
                }
              }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textMain} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor:
                  (step === 0 && canProceedStep0) ||
                  (step === 1 && canProceedStep1) ||
                  (step === 2 && canComplete) ||
                  (step === 3 && canCompleteStep3)
                    ? colors.primary
                    : colors.border,
                flex: 1,
                marginLeft: step > 0 ? 12 : 0,
              },
            ]}
            onPress={step === 3 ? handleSave : () => setStep(step + 1)}
            disabled={
              (step === 0 && !canProceedStep0) ||
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canComplete) ||
              (step === 3 && !canCompleteStep3)
            }
          >
            <Text style={styles.nextBtnText}>{step === 3 ? '시작하기' : '다음'}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setShowDatePicker(false)}
        date={birthdate ?? DEFAULT_PICKER_DATE}
        maximumDate={new Date()}
        minimumDate={new Date(1920, 0, 1)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // 진행 인디케이터
  progressRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingTop: 20, paddingBottom: 8,
  },
  progressDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },

  // 단계 콘텐츠
  stepContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 },
  stepTitle: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  stepSubtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500', marginBottom: 32 },

  // 공통 필드
  fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldHint: { fontSize: 12, fontWeight: '500', marginBottom: 8, marginTop: -4 },
  input: {
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontWeight: '600',
  },

  // 생년월일 피커
  datePickerBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  datePickerText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 10 },
  ageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ageBadgeText: { fontSize: 13, fontWeight: '700' },

  // 성별 카드
  genderCardRow: { flexDirection: 'row', marginBottom: 4 },
  genderCard: {
    flex: 1, marginHorizontal: 6, paddingVertical: 30,
    borderRadius: 24, alignItems: 'center', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  genderCheckCircle: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  genderIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  genderCardLabel: { fontSize: 16, fontWeight: '800' },

  // 직종 검색바
  jobSearchBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 6,
  },
  jobSearchInput: { flex: 1, fontSize: 15, fontWeight: '500', marginLeft: 8, marginRight: 4 },

  // 대분류 그리드
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  categoryCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  categoryEmoji: { fontSize: 20, marginRight: 8 },
  categoryLabel: { flex: 1, fontSize: 13, fontWeight: '700' },

  // 소분류 뒤로가기 버튼
  categoryBackBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, marginBottom: 8,
  },
  categoryBackText: { fontSize: 15, fontWeight: '700', marginLeft: 4 },

  // 직업 행
  jobRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 16, borderWidth: 1.5, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  jobRowIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  jobRowEmoji: { fontSize: 22 },
  jobRowLabel: { flex: 1, fontSize: 14, fontWeight: '700' },

  emptyText: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },

  // 하단 버튼
  footer: {
    padding: 20, paddingBottom: 40,
    flexDirection: 'row', alignItems: 'center',
  },
  backStepBtn: {
    width: 54, height: 60, borderRadius: 18, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtn: {
    height: 60, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  // 시작 방식 선택 템플릿 카드
  templateCard: {
    borderRadius: 20, padding: 20,
    position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  templateCheck: {
    position: 'absolute', top: 14, right: 14,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  templateTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  templateDesc: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  templateItems: { gap: 6 },
  templateItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  templateItemText: { fontSize: 13, fontWeight: '600' },

  // 수정 모드
  editScrollContent: { padding: 20, paddingBottom: 48 },
  editHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12, marginBottom: 24,
  },
  backBtn: { padding: 5 },
  editTitle: { fontSize: 20, fontWeight: '800' },

  saveBtn: {
    height: 60, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
