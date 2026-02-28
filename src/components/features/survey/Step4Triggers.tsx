/**
 * Step 4: 트리거/상황 선택
 * Parity: AUTH-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { ChipGroup } from 'components/tds-ext';
import type { SurveyStep4 } from 'types/dog';

const TRIGGER_OPTIONS = [
  { key: 'strangers', label: '낯선 사람' },
  { key: 'other_dogs', label: '다른 강아지' },
  { key: 'loud_noise', label: '큰 소리' },
  { key: 'alone', label: '혼자 있을 때' },
  { key: 'mealtime', label: '식사 시간' },
  { key: 'walk', label: '산책 중' },
  { key: 'car', label: '차 안' },
  { key: 'vet', label: '병원 방문' },
];

const TIME_OPTIONS = [
  { key: 'morning', label: '아침' },
  { key: 'afternoon', label: '오후' },
  { key: 'evening', label: '저녁' },
  { key: 'night', label: '밤' },
  { key: 'random', label: '불규칙' },
];

interface Props {
  value?: SurveyStep4;
  onChange: (v: SurveyStep4) => void;
}

export function Step4Triggers({ value, onChange }: Props) {
  const current: SurveyStep4 = value ?? { triggers: [], worst_time: 'random' };

  const handleTriggerSelect = (key: string) => {
    const exists = current.triggers.includes(key);
    const next = exists
      ? current.triggers.filter((t) => t !== key)
      : [...current.triggers, key];
    onChange({ ...current, triggers: next });
  };

  return (
    <View>
      <Text style={styles.title}>어떤 상황에서 문제가 심해지나요?</Text>
      <Text style={styles.subtitle}>해당하는 것을 모두 선택해주세요</Text>

      <ChipGroup
        items={TRIGGER_OPTIONS}
        selectedKeys={current.triggers}
        onSelect={handleTriggerSelect}
        multiSelect
      />

      <Text style={styles.label}>가장 심한 시간대</Text>
      <ChipGroup
        items={TIME_OPTIONS}
        selectedKeys={[current.worst_time]}
        onSelect={(key) => onChange({ ...current, worst_time: key as SurveyStep4['worst_time'] })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.subtitle, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { ...typography.detail, color: colors.textSecondary, marginBottom: 20 },
  label: { ...typography.detail, fontWeight: '600', color: colors.textDark, marginTop: 24, marginBottom: 12 },
});
