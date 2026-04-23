/**
 * StepCompletionSheet — 스텝 완료 후 강아지 반응 피드백 바텀시트 + 상세 기록 (Phase 6)
 * ModalLayout 패턴 재사용. REACTION_OPTIONS 기반 렌더링.
 * Parity: UI-001 + UI-TRAINING-DETAIL-001
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, Modal } from 'react-native';
import { ModalLayout } from 'components/shared/layouts/ModalLayout';
import { REACTION_OPTIONS, SITUATION_CHIPS } from 'types/training';
import type { DogReaction } from 'types/training';
import { colors, typography, spacing } from 'styles/tokens';

const REACTION_COLOR_MAP: Record<string, string> = {
  successGreen: colors.green500,
  warningAmber: colors.orange500,
  errorRed: colors.red500,
};

const REACTION_BG_MAP: Record<string, string> = {
  successGreen: colors.green50,
  warningAmber: colors.orange50,
  errorRed: colors.red50,
};

interface Props {
  visible: boolean;
  dogName: string;
  isPro?: boolean;
  onSubmit: (
    reaction: DogReaction,
    memo: string | null,
    detailData?: { situationTags: string[]; whatWorked: string; whatDidntWork: string }
  ) => void;
  onSkip: () => void;
  onSaved?: () => void;
}

export function StepCompletionSheet({ visible, dogName, onSubmit, onSkip, onSaved }: Props) {
  const [selected, setSelected] = useState<DogReaction | null>(null);
  const [memo, setMemo] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [situationTags, setSituationTags] = useState<string[]>([]);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidntWork, setWhatDidntWork] = useState('');
  const [saved, setSaved] = useState(false);
  const savedOpacity = useRef(new Animated.Value(0)).current;

  // visible이 false로 바뀌면 내부 상태 초기화
  useEffect(() => {
    if (!visible) {
      setSelected(null);
      setMemo('');
      setShowDetail(false);
      setSituationTags([]);
      setWhatWorked('');
      setWhatDidntWork('');
      setSaved(false);
      savedOpacity.setValue(0);
    }
  }, [visible, savedOpacity]);

  const handleSubmit = () => {
    if (!selected) return;
    const detailData = showDetail ? { situationTags, whatWorked, whatDidntWork } : undefined;
    onSubmit(selected, memo.trim() || null, detailData);
    setSaved(true);
    Animated.timing(savedOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleSkip = () => {
    setSelected(null);
    setMemo('');
    setShowDetail(false);
    setSituationTags([]);
    setWhatWorked('');
    setWhatDidntWork('');
    onSkip();
  };

  const toggleChip = (chipLabel: string) => {
    setSituationTags((prev) =>
      prev.includes(chipLabel) ? prev.filter((t) => t !== chipLabel) : [...prev, chipLabel]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ModalLayout
        title={saved ? '' : `훈련 중 ${dogName}의 반응은?`}
        onClose={saved ? onSaved : handleSkip}
      >
        {saved ? (
          <Animated.View style={[styles.savedContainer, { opacity: savedOpacity }]}>
            <Text style={styles.savedCheck}>{'\u2705'}</Text>
            <Text style={styles.savedText}>반응이 저장됐어요</Text>
            <TouchableOpacity style={styles.savedConfirmButton} onPress={onSaved} activeOpacity={0.8}>
              <Text style={styles.savedConfirmText}>확인</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <View style={styles.options}>
              {REACTION_OPTIONS.map((option) => {
                const isSelected = selected === option.value;
                const accent = REACTION_COLOR_MAP[option.color] ?? colors.grey500;
                const bg = REACTION_BG_MAP[option.color] ?? colors.grey50;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionCard,
                      isSelected && { borderColor: accent, backgroundColor: bg },
                    ]}
                    onPress={() => setSelected(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={styles.emoji}>{option.emoji}</Text>
                      <Text style={[styles.optionLabel, isSelected && { color: accent }]}>
                        {option.label}
                      </Text>
                    </View>
                    <Text style={styles.effectText}>{option.effect}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selected && (
              <TextInput
                style={styles.memoInput}
                placeholder="메모 입력 (선택)"
                placeholderTextColor={colors.placeholder}
                value={memo}
                onChangeText={setMemo}
                multiline
                maxLength={200}
              />
            )}

            {/* 더 자세히 기록하기 토글 */}
            {selected && (
              <TouchableOpacity
                style={styles.detailToggle}
                onPress={() => setShowDetail(!showDetail)}
                activeOpacity={0.7}
              >
                <Text style={styles.detailToggleText}>
                  {showDetail ? '▼' : '▶'} 더 자세히 기록하기
                </Text>
              </TouchableOpacity>
            )}

            {/* 상세 기록 섹션 */}
            {showDetail && selected && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>상황 칩 선택</Text>
                <View style={styles.chipsRow}>
                  {SITUATION_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip.id}
                      style={[
                        styles.chip,
                        situationTags.includes(chip.label) && styles.chipSelected,
                      ]}
                      onPress={() => toggleChip(chip.label)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{chip.emoji} {chip.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.detailInput}
                  placeholder="뭐가 효과 있었나요? (선택)"
                  placeholderTextColor={colors.placeholder}
                  value={whatWorked}
                  onChangeText={setWhatWorked}
                  multiline
                  maxLength={200}
                />
                <TextInput
                  style={styles.detailInput}
                  placeholder="아쉬웠던 점은요? (선택)"
                  placeholderTextColor={colors.placeholder}
                  value={whatDidntWork}
                  onChangeText={setWhatDidntWork}
                  multiline
                  maxLength={200}
                />
              </View>
            )}

            <View style={styles.actions}>
              {selected && (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                  <Text style={styles.submitText}>저장하기</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
                <Text style={styles.skipText}>건너뛰기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ModalLayout>
    </Modal>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 14,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  optionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  effectText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.detail,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  detailToggle: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.grey50,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  detailToggleText: {
    ...typography.detail,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  detailSection: {
    backgroundColor: colors.grey50,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipSelected: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  chipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    ...typography.detail,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  savedContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  savedCheck: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  savedText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.green500,
    marginBottom: spacing.xl,
  },
  savedConfirmButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
  },
  savedConfirmText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.white,
  },
  actions: {
    gap: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    ...typography.detail,
    color: colors.textSecondary,
  },
});
