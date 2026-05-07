/**
 * Stage 3 설문 — 기질 & 건강 (12문항, Pro 전환 시)
 * 완료 → 풀 개인화 AI 코칭 활성화
 * Parity: APP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Image,
  Alert, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { FormLayout } from 'components/shared/layouts/FormLayout';
import { useSubmitStage3 } from 'lib/hooks/useSurvey';
import { useDraftSave } from 'lib/hooks/useDraftSave';
import { ICONS } from 'lib/data/iconSources';
import { useActiveDog } from 'stores/ActiveDogContext';
import { colors, spacing, typography } from 'styles/tokens';
import type { SurveyStage3Request } from 'types/dog';

export const Route = createRoute('/onboarding/stage3-form', {
  component: Stage3FormPage,
  screenOptions: { headerShown: false },
});

type RouteParams = { dogId: string; dogName: string };

interface Stage3Draft {
  healthStatus: HealthStatus | null;
  healthIssues: string[];
  healthNote: string;
  hadSurgery: boolean | null;
  surgeryNote: string;
  envReaction: EnvReaction | null;
  personReaction: PersonReaction | null;
  dogReaction: DogReaction | null;
  noiseReaction: NoiseReaction | null;
  focusLevel: FocusLevel | null;
  attachLevel: AttachLevel | null;
  energyLevel: number | null;
  rewards: string[];
  walkMinutes: string;
}

type HealthStatus = 'healthy' | 'concern' | 'treatment';
type EnvReaction = 'explore' | 'adapt' | 'anxious' | 'indifferent';
type PersonReaction = 'rush' | 'observe' | 'hide' | 'indifferent';
type DogReaction = 'approach' | 'sniff' | 'bark' | 'indifferent';
type NoiseReaction = 'calm' | 'recover' | 'prolonged';
type FocusLevel = 'treat_only' | 'good' | 'distracted' | 'uninterested';
type AttachLevel = 'velcro' | 'moderate' | 'independent';

const HEALTH_ISSUES = [
  { id: 'joint_disc', label: '관절·디스크', iconSource: ICONS['ic-paw'] },
  { id: 'skin_allergy', label: '피부·알레르기', iconSource: ICONS['ic-idea'] },
  { id: 'heart', label: '심장·호흡', iconSource: ICONS['ic-bolt'] },
  { id: 'digestive', label: '소화기', iconSource: ICONS['ic-cat-meal'] },
];

const REWARDS = [
  { id: 'treat', label: '간식', iconSource: ICONS['ic-cat-meal'] },
  { id: 'toy', label: '장난감·놀이', iconSource: ICONS['ic-cat-play'] },
  { id: 'praise', label: '칭찬·스킨십', iconSource: ICONS['ic-paw'] },
  { id: 'walk', label: '산책', iconSource: ICONS['ic-cat-walk'] },
];

function Stage3FormPage() {
  const navigation = useNavigation();
  const params = Route.useParams() as RouteParams;
  const { activeDog } = useActiveDog();
  const targetDogId = params.dogId ?? activeDog?.id;
  const displayDogName = params.dogName ?? activeDog?.name ?? '우리 아이';
  const submitStage3 = useSubmitStage3();

  // 건강 상태
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [healthNote, setHealthNote] = useState('');
  const [hadSurgery, setHadSurgery] = useState<boolean | null>(null);
  const [surgeryNote, setSurgeryNote] = useState('');

  // 기질
  const [envReaction, setEnvReaction] = useState<EnvReaction | null>(null);
  const [personReaction, setPersonReaction] = useState<PersonReaction | null>(null);
  const [dogReaction, setDogReaction] = useState<DogReaction | null>(null);
  const [noiseReaction, setNoiseReaction] = useState<NoiseReaction | null>(null);
  const [focusLevel, setFocusLevel] = useState<FocusLevel | null>(null);
  const [attachLevel, setAttachLevel] = useState<AttachLevel | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [rewards, setRewards] = useState<string[]>([]);
  const [walkMinutes, setWalkMinutes] = useState('');

  const draftData: Stage3Draft = {
    healthStatus, healthIssues, healthNote, hadSurgery, surgeryNote,
    envReaction, personReaction, dogReaction, noiseReaction,
    focusLevel, attachLevel, energyLevel, rewards, walkMinutes,
  };

  const { loadedDraft, clearDraft } = useDraftSave<Stage3Draft>({
    stageKey: `stage3_${targetDogId ?? 'direct-entry'}`,
    data: draftData,
  });

  useEffect(() => {
    if (!loadedDraft || healthStatus !== null) return;
    setHealthStatus(loadedDraft.healthStatus);
    setHealthIssues(loadedDraft.healthIssues);
    setHealthNote(loadedDraft.healthNote);
    setHadSurgery(loadedDraft.hadSurgery);
    setSurgeryNote(loadedDraft.surgeryNote);
    setEnvReaction(loadedDraft.envReaction);
    setPersonReaction(loadedDraft.personReaction);
    setDogReaction(loadedDraft.dogReaction);
    setNoiseReaction(loadedDraft.noiseReaction);
    setFocusLevel(loadedDraft.focusLevel);
    setAttachLevel(loadedDraft.attachLevel);
    setEnergyLevel(loadedDraft.energyLevel);
    setRewards(loadedDraft.rewards);
    setWalkMinutes(loadedDraft.walkMinutes);
  }, [loadedDraft]);

  const toggleIssue = (id: string) => {
    setHealthIssues((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleReward = (id: string) => {
    setRewards((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2 ? [...prev, id] : prev,
    );
  };

  const buildChronicIssues = (): string[] => {
    const issues = [...healthIssues];
    if (healthNote.trim()) issues.push(healthNote.trim());
    if (hadSurgery && surgeryNote.trim()) issues.push(`수술: ${surgeryNote.trim()}`);
    return issues;
  };

  const handleSubmit = useCallback(() => {
    if (!targetDogId) {
      Alert.alert('반려견 정보가 필요해요', '먼저 반려견 프로필을 등록한 뒤 다시 시도해주세요.', [
        { text: '확인', onPress: () => navigation.navigate('/onboarding/stage1-form' as never) },
      ]);
      return;
    }

    const payload: SurveyStage3Request = {
      temperament: {
        sensitivity_score: noiseReaction === 'prolonged' ? 5 : noiseReaction === 'recover' ? 3 : 1,
        energy_level: energyLevel ?? undefined,
        env_reaction: envReaction ?? undefined,
        person_reaction: personReaction ?? undefined,
        dog_reaction: dogReaction ?? undefined,
        focus_level: focusLevel ?? undefined,
        attach_level: attachLevel ?? undefined,
      },
      health_meta: {
        chronic_issues: buildChronicIssues(),
        medications: [],
        vet_notes: healthStatus === 'healthy' ? undefined : healthNote || undefined,
      },
      activity_meta: {
        daily_walk_minutes: walkMinutes ? parseInt(walkMinutes, 10) : 0,
        exercise_level: energyLevel && energyLevel >= 4 ? 'high' : energyLevel && energyLevel <= 2 ? 'low' : 'medium',
      },
      rewards_meta: { ids: rewards },
    };

    submitStage3.mutate({ dogId: targetDogId, data: payload }, {
      onSuccess: async () => {
        await clearDraft();
        navigation.navigate('/coaching/result');
      },
      onError: (err) => {
        Alert.alert('저장 실패', err.message.slice(0, 200));
      },
    });
  }, [targetDogId, healthStatus, healthIssues, healthNote, hadSurgery, surgeryNote, envReaction, personReaction, dogReaction, noiseReaction, focusLevel, attachLevel, energyLevel, rewards, walkMinutes, submitStage3, navigation]);

  return (
    <FormLayout
      title={`${displayDogName}의 기질과 건강`}
      onBack={() => navigation.goBack()}
      bottomCTA={{
        label: submitStage3.isPending ? '저장 중...' : 'Pro 풀 개인화 활성화',
        onPress: handleSubmit,
        disabled: submitStage3.isPending,
      }}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 건강 섹션 ── */}
        <SectionHeader iconSource={ICONS['ic-paw']} title="건강 상태" />

        <Section label="지금 건강 상태가 어때요?">
          <ChipGroup>
            <Chip label="튼튼해요" iconSource={ICONS['ic-paw']} selected={healthStatus === 'healthy'} onPress={() => setHealthStatus('healthy')} />
            <Chip label="신경 쓰이는 게 있어요" iconSource={ICONS['ic-idea']} selected={healthStatus === 'concern'} onPress={() => setHealthStatus('concern')} />
            <Chip label="치료 중이에요" iconSource={ICONS['ic-bolt']} selected={healthStatus === 'treatment'} onPress={() => setHealthStatus('treatment')} />
          </ChipGroup>
        </Section>

        {healthStatus === 'concern' || healthStatus === 'treatment' ? (
          <>
            <Section label="어떤 부분이에요?" hint="해당하는 것 모두 선택">
              <ChipGroup wrap>
                {HEALTH_ISSUES.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    iconSource={item.iconSource}
                    selected={healthIssues.includes(item.id)}
                    onPress={() => toggleIssue(item.id)}
                  />
                ))}
              </ChipGroup>
              <TextInput
                style={[styles.input, styles.mt8]}
                value={healthNote}
                onChangeText={setHealthNote}
                placeholder="직접 입력 (예: 디스크 수술 후 재활 중)"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </Section>
          </>
        ) : null}

        <Section label="수술 경험이 있나요? (중성화 제외)">
          <ChipGroup>
            <Chip label="있어요" iconSource={ICONS['ic-paw']} selected={hadSurgery === true} onPress={() => setHadSurgery(true)} />
            <Chip label="없어요" iconSource={ICONS['ic-target']} selected={hadSurgery === false} onPress={() => setHadSurgery(false)} />
          </ChipGroup>
          {hadSurgery ? (
            <TextInput
              style={[styles.input, styles.mt8]}
              value={surgeryNote}
              onChangeText={setSurgeryNote}
              placeholder="예: 슬개골 수술"
              placeholderTextColor={colors.textSecondary}
              maxLength={80}
            />
          ) : null}
        </Section>

        {/* ── 기질 섹션 ── */}
        <SectionHeader iconSource={ICONS['ic-idea']} title="기질 파악" />

        <Section label="낯선 곳에 가면 어떻게 해요?">
          <ChipGroup wrap>
            <Chip label="신나게 탐험해요" iconSource={ICONS['ic-search']} selected={envReaction === 'explore'} onPress={() => setEnvReaction('explore')} />
            <Chip label="천천히 적응해요" iconSource={ICONS['ic-paw']} selected={envReaction === 'adapt'} onPress={() => setEnvReaction('adapt')} />
            <Chip label="많이 불안해해요" iconSource={ICONS['ic-cat-anxiety']} selected={envReaction === 'anxious'} onPress={() => setEnvReaction('anxious')} />
            <Chip label="관심 없어요" iconSource={ICONS['ic-target']} selected={envReaction === 'indifferent'} onPress={() => setEnvReaction('indifferent')} />
          </ChipGroup>
        </Section>

        <Section label="집에 낯선 사람이 오면?">
          <ChipGroup wrap>
            <Chip label="달려가서 반가워해요" iconSource={ICONS['ic-bolt']} selected={personReaction === 'rush'} onPress={() => setPersonReaction('rush')} />
            <Chip label="살펴보다 다가가요" iconSource={ICONS['ic-search']} selected={personReaction === 'observe'} onPress={() => setPersonReaction('observe')} />
            <Chip label="숨거나 피해요" iconSource={ICONS['ic-cat-fear']} selected={personReaction === 'hide'} onPress={() => setPersonReaction('hide')} />
            <Chip label="별 반응 없어요" iconSource={ICONS['ic-target']} selected={personReaction === 'indifferent'} onPress={() => setPersonReaction('indifferent')} />
          </ChipGroup>
        </Section>

        <Section label="다른 개를 만나면?">
          <ChipGroup wrap>
            <Chip label="먼저 달려가요" iconSource={ICONS['ic-paw']} selected={dogReaction === 'approach'} onPress={() => setDogReaction('approach')} />
            <Chip label="냄새 맡으며 탐색해요" iconSource={ICONS['ic-search']} selected={dogReaction === 'sniff'} onPress={() => setDogReaction('sniff')} />
            <Chip label="짖거나 공격해요" iconSource={ICONS['ic-cat-barking']} selected={dogReaction === 'bark'} onPress={() => setDogReaction('bark')} />
            <Chip label="무관심해요" iconSource={ICONS['ic-target']} selected={dogReaction === 'indifferent'} onPress={() => setDogReaction('indifferent')} />
          </ChipGroup>
        </Section>

        <Section label="큰 소리가 나면?">
          <ChipGroup wrap>
            <Chip label="별 반응 없어요" iconSource={ICONS['ic-target']} selected={noiseReaction === 'calm'} onPress={() => setNoiseReaction('calm')} />
            <Chip label="놀라지만 금방 괜찮아요" iconSource={ICONS['ic-bolt']} selected={noiseReaction === 'recover'} onPress={() => setNoiseReaction('recover')} />
            <Chip label="오래 불안해해요" iconSource={ICONS['ic-cat-anxiety']} selected={noiseReaction === 'prolonged'} onPress={() => setNoiseReaction('prolonged')} />
          </ChipGroup>
        </Section>

        <Section label="훈련이나 놀이에 얼마나 집중해요?">
          <ChipGroup wrap>
            <Chip label="간식 있으면 최고예요" iconSource={ICONS['ic-target']} selected={focusLevel === 'treat_only'} onPress={() => setFocusLevel('treat_only')} />
            <Chip label="집중력 좋아요" iconSource={ICONS['ic-training']} selected={focusLevel === 'good'} onPress={() => setFocusLevel('good')} />
            <Chip label="금방 딴짓해요" iconSource={ICONS['ic-puzzle']} selected={focusLevel === 'distracted'} onPress={() => setFocusLevel('distracted')} />
            <Chip label="별 관심 없어요" iconSource={ICONS['ic-target']} selected={focusLevel === 'uninterested'} onPress={() => setFocusLevel('uninterested')} />
          </ChipGroup>
        </Section>

        <Section label="보호자한테 얼마나 붙어 있어요?">
          <ChipGroup>
            <Chip label="껌딱지예요" iconSource={ICONS['ic-paw']} selected={attachLevel === 'velcro'} onPress={() => setAttachLevel('velcro')} />
            <Chip label="적당히 가까이요" iconSource={ICONS['ic-dog']} selected={attachLevel === 'moderate'} onPress={() => setAttachLevel('moderate')} />
            <Chip label="독립적이에요" iconSource={ICONS['ic-cat-walk']} selected={attachLevel === 'independent'} onPress={() => setAttachLevel('independent')} />
          </ChipGroup>
        </Section>

        <Section label="에너지 레벨이 어느 정도예요?">
          <View style={styles.energyRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.energyBtn, energyLevel === n && styles.energyBtnSelected]}
                onPress={() => setEnergyLevel(n)}
                activeOpacity={0.7}
              >
                <Text style={[styles.energyText, energyLevel === n && styles.energyTextSelected]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyLabel}>조용해요</Text>
            <Text style={styles.energyLabel}>활발해요</Text>
          </View>
        </Section>

        <Section label="하루 총 산책 시간이 얼마예요? (분)">
          <TextInput
            style={[styles.input, styles.inputNarrow]}
            value={walkMinutes}
            onChangeText={setWalkMinutes}
            placeholder="30"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
          />
        </Section>

        <Section label="가장 좋아하는 보상이 뭐예요?" hint="최대 2개">
          <ChipGroup wrap>
            {REWARDS.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                iconSource={item.iconSource}
                selected={rewards.includes(item.id)}
                onPress={() => toggleReward(item.id)}
              />
            ))}
          </ChipGroup>
        </Section>

      </ScrollView>
    </FormLayout>
  );
}

function SectionHeader({ iconSource, title }: { iconSource?: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      {iconSource ? <Image source={{ uri: iconSource }} style={styles.sectionHeaderIcon} /> : null}
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

function ChipGroup({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return <View style={[styles.chipGroup, wrap && styles.chipGroupWrap]}>{children}</View>;
}

function Chip({
  label, iconSource, selected, onPress,
}: { label: string; iconSource?: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {iconSource ? <Image source={{ uri: iconSource }} style={styles.chipIcon} /> : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.screenHorizontal, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderIcon: { width: 24, height: 24 },
  sectionHeaderText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: { marginBottom: spacing.xl },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textSecondary },
  chipGroup: { flexDirection: 'row', gap: spacing.sm },
  chipGroupWrap: { flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 4,
  },
  chipSelected: { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlueLight },
  chipIcon: { width: 18, height: 18 },
  chipText: { ...typography.bodySmall, color: colors.textSecondary },
  chipTextSelected: { color: colors.primaryBlue, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
  },
  inputNarrow: { width: 120 },
  mt8: { marginTop: 8 },
  energyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  energyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  energyBtnSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.primaryBlueLight,
  },
  energyText: { ...typography.body, color: colors.textSecondary, fontWeight: '700' },
  energyTextSelected: { color: colors.primaryBlue },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyLabel: { ...typography.caption, color: colors.textSecondary },
});
