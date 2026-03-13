/**
 * RecordModal — 개별 기록 바텀시트 (프리셋 칩 + 메모 + "저장 & 다음")
 * Parity: B2B-001
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { PresetChipGrid } from './PresetChipGrid';
import type { PresetOption } from 'lib/data/presets';
import type { OpsItem } from './OpsListItem';

interface RecordModalProps {
  item: OpsItem;
  onSave: (data: { dogId: string; presetId: string; memo: string; intensity: number }) => void;
  onSaveAndNext: (data: { dogId: string; presetId: string; memo: string; intensity: number }) => void;
  onClose: () => void;
}

export function RecordModal({ item, onSave, onSaveAndNext, onClose }: RecordModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetOption | null>(null);
  const [memo, setMemo] = useState('');

  const handlePresetSelect = useCallback((preset: PresetOption) => {
    setSelectedPreset(preset);
    setMemo(preset.defaultMemo);
  }, []);

  const buildPayload = useCallback(() => {
    if (!selectedPreset) return null;
    return {
      dogId: item.dogId,
      presetId: selectedPreset.id,
      memo,
      intensity: selectedPreset.defaultIntensity,
    };
  }, [selectedPreset, memo, item.dogId]);

  const handleSave = useCallback(() => {
    const payload = buildPayload();
    if (payload) onSave(payload);
  }, [buildPayload, onSave]);

  const handleSaveAndNext = useCallback(() => {
    const payload = buildPayload();
    if (payload) onSaveAndNext(payload);
  }, [buildPayload, onSaveAndNext]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.dogName}>{item.dogName}</Text>
          {item.parentName && <Text style={styles.parentName}>{item.parentName}</Text>}
        </View>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtn}>{'\u2715'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <PresetChipGrid onSelect={handlePresetSelect} selectedId={selectedPreset?.id} />

        <View style={styles.memoSection}>
          <Text style={styles.memoLabel}>메모</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="추가 메모 (선택)"
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !selectedPreset && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!selectedPreset}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveNextBtn, !selectedPreset && styles.saveBtnDisabled]}
          onPress={handleSaveAndNext}
          disabled={!selectedPreset}
          activeOpacity={0.8}
        >
          <Text style={styles.saveNextBtnText}>저장 & 다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  dogName: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  parentName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    ...typography.sectionTitle,
    color: colors.textSecondary,
    padding: 4,
  },
  body: {
    flex: 1,
  },
  memoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  memoLabel: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.detail,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.divider,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textDark,
  },
  saveNextBtn: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveNextBtnText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
});
