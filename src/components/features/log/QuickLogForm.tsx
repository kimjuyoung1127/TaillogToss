/**
 * QuickLogForm — 빠른 기록 폼 (Chip 선택 + 강도 + 시간)
 * 원탭 카테고리 선택 → 강도/시간 조절 → 저장
 * Parity: UI-001, LOG-001
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QuickLogChips } from 'components/features/dashboard/QuickLogChips';
import { DateTimePicker } from 'components/tds-ext/DateTimePicker';
import type { QuickLogCategory, DailyActivityCategory, IntensityLevel, QuickLogInput } from 'types/log';

export interface QuickLogFormProps {
  dogId: string;
  onSubmit: (input: QuickLogInput) => void;
  isLoading?: boolean;
}

export function QuickLogForm({ dogId, onSubmit, isLoading = false }: QuickLogFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<IntensityLevel>(3);
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [memo, setMemo] = useState('');
  const [showTimeDetail, setShowTimeDetail] = useState(false);

  const canSubmit = selectedCategory !== null;

  const handleBehaviorSelect = useCallback((category: QuickLogCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleActivitySelect = useCallback((category: DailyActivityCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedCategory) return;
    onSubmit({
      dog_id: dogId,
      category: selectedCategory as QuickLogCategory | DailyActivityCategory,
      intensity,
      occurred_at: occurredAt.toISOString(),
      memo: memo || undefined,
    });
  }, [dogId, selectedCategory, intensity, occurredAt, memo, canSubmit, onSubmit]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <QuickLogChips
        onSelectBehavior={handleBehaviorSelect}
        onSelectActivity={handleActivitySelect}
        selectedKey={selectedCategory ?? undefined}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>강도: {intensity}</Text>
        <View style={styles.intensityRow}>
          {([1, 2, 3, 5, 7, 10] as IntensityLevel[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.intensityChip, intensity === v && styles.intensityActive]}
              onPress={() => setIntensity(v)}
            >
              <Text style={[styles.intensityText, intensity === v && styles.intensityTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.timeRow}>
          <Text style={styles.sectionLabel}>시간: {occurredAt.getHours()}:{String(occurredAt.getMinutes()).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => setShowTimeDetail(!showTimeDetail)}>
            <Text style={styles.changeText}>{showTimeDetail ? '접기' : '변경'}</Text>
          </TouchableOpacity>
        </View>
        {showTimeDetail && <DateTimePicker value={occurredAt} onChange={setOccurredAt} mode="time" />}
      </View>

      <View style={styles.section}>
        <TextInput
          style={styles.memoInput}
          placeholder="메모 (선택)"
          value={memo}
          onChangeText={setMemo}
          placeholderTextColor="#B0B8C1"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitText}>{isLoading ? '저장 중...' : '저장'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E5968',
    marginBottom: 8,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityChip: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityActive: {
    backgroundColor: '#0064FF',
  },
  intensityText: {
    fontSize: 14,
    color: '#4E5968',
    fontWeight: '500',
  },
  intensityTextActive: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 13,
    color: '#0064FF',
    fontWeight: '500',
  },
  memoInput: {
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#202632',
    backgroundColor: '#FAFBFC',
    minHeight: 60,
  },
  submitButton: {
    backgroundColor: '#0064FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitDisabled: {
    backgroundColor: '#B0B8C1',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
