/**
 * VariantSelector — Plan A/B/C 탭 전환 (SegmentedControl 패턴)
 * Parity: UI-001
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { PlanVariant } from 'types/training';
import { colors, typography } from 'styles/tokens';

interface VariantSelectorProps {
  current: PlanVariant;
  onChange: (variant: PlanVariant) => void;
  isPro: boolean;
}

const VARIANTS: { key: PlanVariant; label: string; proOnly: boolean }[] = [
  { key: 'A', label: 'Plan A', proOnly: false },
  { key: 'B', label: 'Plan B', proOnly: false },
  { key: 'C', label: 'Plan C', proOnly: true },
];

export function VariantSelector({ current, onChange, isPro }: VariantSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>훈련 방법</Text>
      <View style={styles.segmented}>
        {VARIANTS.map(({ key, label, proOnly }) => {
          const isActive = current === key;
          const isDisabled = proOnly && !isPro;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
                isDisabled && styles.segmentDisabled,
              ]}
              onPress={() => !isDisabled && onChange(key)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                  isDisabled && styles.segmentTextDisabled,
                ]}
              >
                {label}
              </Text>
              {isDisabled && <Text style={styles.lockIcon}>{'🔒'}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.divider,
    borderRadius: 10,
    padding: 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  segmentActive: {
    backgroundColor: colors.white,
    shadowColor: colors.grey950,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentDisabled: {
    opacity: 0.5,
  },
  segmentText: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primaryBlue,
  },
  segmentTextDisabled: {
    color: colors.textTertiary,
  },
  lockIcon: {
    ...typography.badge,
  },
});
