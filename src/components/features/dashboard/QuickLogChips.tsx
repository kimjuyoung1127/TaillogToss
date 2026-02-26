/**
 * QuickLogChips — 빠른 기록 카테고리 Chip 그리드 (8행동 + 6일상)
 * 원탭 = 해당 카테고리로 즉시 기록 (intensity=3 기본값)
 * Parity: UI-001, LOG-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from 'components/tds-ext/Chip';
import type { QuickLogCategory, DailyActivityCategory } from 'types/log';

/** 행동 카테고리 라벨 매핑 */
const BEHAVIOR_CHIPS: { key: QuickLogCategory; label: string }[] = [
  { key: 'barking', label: '짖음/울음' },
  { key: 'aggression', label: '공격성' },
  { key: 'anxiety', label: '분리불안' },
  { key: 'destructive', label: '파괴행동' },
  { key: 'biting', label: '마운팅' },
  { key: 'jumping', label: '과잉흥분' },
  { key: 'pulling', label: '배변문제' },
  { key: 'other_behavior', label: '공포/회피' },
];

/** 일상 활동 카테고리 라벨 매핑 */
const ACTIVITY_CHIPS: { key: DailyActivityCategory; label: string }[] = [
  { key: 'walk', label: '산책' },
  { key: 'meal', label: '식사' },
  { key: 'training', label: '훈련' },
  { key: 'play', label: '놀이' },
  { key: 'rest', label: '휴식' },
  { key: 'grooming', label: '그루밍' },
];

export interface QuickLogChipsProps {
  onSelectBehavior: (category: QuickLogCategory) => void;
  onSelectActivity: (category: DailyActivityCategory) => void;
  selectedKey?: string;
}

export function QuickLogChips({ onSelectBehavior, onSelectActivity, selectedKey }: QuickLogChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>행동 문제</Text>
      <View style={styles.chipRow}>
        {BEHAVIOR_CHIPS.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            selected={selectedKey === chip.key}
            onPress={() => onSelectBehavior(chip.key)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>일상 활동</Text>
      <View style={styles.chipRow}>
        {ACTIVITY_CHIPS.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            selected={selectedKey === chip.key}
            onPress={() => onSelectActivity(chip.key)}
          />
        ))}
      </View>
    </View>
  );
}

export { BEHAVIOR_CHIPS, ACTIVITY_CHIPS };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B95A1',
    marginBottom: 8,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
