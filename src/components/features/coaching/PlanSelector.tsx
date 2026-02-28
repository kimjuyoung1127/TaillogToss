/**
 * PlanSelector — Plan B/C 바텀시트 선택
 * ModalLayout 활용, Plan A/B/C 중 하나 선택
 * Parity: AI-001
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import type { PlanVariant } from 'types/training';
import { ModalLayout } from 'components/shared/layouts/ModalLayout';
import { colors, typography } from 'styles/tokens';

interface PlanSelectorProps {
  visible: boolean;
  currentVariant: PlanVariant;
  variantNotes: Record<PlanVariant, string>;
  isPro?: boolean;
  onSelect: (variant: PlanVariant) => void;
  onClose: () => void;
}

const VARIANTS: PlanVariant[] = ['A', 'B', 'C'];

const VARIANT_LABELS: Record<PlanVariant, string> = {
  A: 'Plan A — 표준',
  B: 'Plan B — 쉬운 버전',
  C: 'Plan C — 심화 버전',
};

export function PlanSelector({
  visible,
  currentVariant,
  variantNotes,
  isPro = false,
  onSelect,
  onClose,
}: PlanSelectorProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <ModalLayout
        title="훈련 방법 선택"
        onClose={onClose}
      >
        <Text style={styles.desc}>
          현재 방법이 어렵거나 쉽다면 다른 방법을 시도해보세요.
        </Text>
        {VARIANTS.map((v) => {
          const isSelected = v === currentVariant;
          const isLocked = v === 'C' && !isPro;
          return (
            <TouchableOpacity
              key={v}
              style={[styles.option, isSelected && styles.optionSelected, isLocked && styles.optionLocked]}
              onPress={() => !isLocked && onSelect(v)}
              activeOpacity={isLocked ? 1 : 0.7}
              disabled={isLocked}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected, isLocked && styles.optionLabelLocked]}>
                  {VARIANT_LABELS[v]}
                </Text>
                {isLocked && <Text style={styles.lockIcon}>{'🔒'}</Text>}
              </View>
              <Text style={[styles.optionNote, isLocked && styles.optionNoteLocked]}>
                {isLocked ? 'PRO 구독으로 이용 가능' : variantNotes[v]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ModalLayout>
    </Modal>
  );
}

const styles = StyleSheet.create({
  desc: {
    ...typography.detail,
    color: colors.grey600,
    marginBottom: 16,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: '#0064FF08',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.grey300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    borderColor: colors.primaryBlue,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryBlue,
  },
  optionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textDark,
  },
  optionLabelSelected: {
    color: colors.primaryBlue,
  },
  optionLocked: {
    opacity: 0.5,
    borderColor: colors.border,
  },
  optionLabelLocked: {
    color: colors.placeholder,
  },
  lockIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
  optionNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 30,
  },
  optionNoteLocked: {
    color: colors.placeholder,
  },
});
