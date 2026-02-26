/**
 * ABCForm — 상세 ABC 기록 폼 (선행-행동-결과 + 강도/시간/위치)
 * Accordion 펼침 구조, 와이어프레임 9-4 상세탭 기준
 * Parity: UI-001, LOG-001
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Accordion } from 'components/tds-ext/Accordion';
import { DateTimePicker } from 'components/tds-ext/DateTimePicker';
import type { DetailedLogInput, IntensityLevel } from 'types/log';

export interface ABCFormProps {
  dogId: string;
  onSubmit: (input: DetailedLogInput) => void;
  isLoading?: boolean;
}

export function ABCForm({ dogId, onSubmit, isLoading = false }: ABCFormProps) {
  const [behavior, setBehavior] = useState('');
  const [antecedent, setAntecedent] = useState('');
  const [consequence, setConsequence] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>(5);
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');

  const canSubmit = behavior.trim().length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      dog_id: dogId,
      type_id: 'manual',
      antecedent,
      behavior,
      consequence,
      intensity,
      location: location || undefined,
      memo: memo || undefined,
      occurred_at: occurredAt.toISOString(),
    });
  }, [dogId, antecedent, behavior, consequence, intensity, location, memo, occurredAt, canSubmit, onSubmit]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>행동(B) *</Text>
      <TextInput
        style={styles.input}
        placeholder="어떤 행동을 했나요?"
        value={behavior}
        onChangeText={setBehavior}
        placeholderTextColor="#B0B8C1"
      />

      <Accordion title="선행(A)">
        <TextInput
          style={styles.input}
          placeholder="행동 직전에 어떤 상황이었나요?"
          value={antecedent}
          onChangeText={setAntecedent}
          placeholderTextColor="#B0B8C1"
          multiline
        />
      </Accordion>

      <Accordion title="결과(C)">
        <TextInput
          style={styles.input}
          placeholder="행동 후 어떤 결과가 있었나요?"
          value={consequence}
          onChangeText={setConsequence}
          placeholderTextColor="#B0B8C1"
          multiline
        />
      </Accordion>

      <Accordion title="강도 / 시간">
        <Text style={styles.subLabel}>강도: {intensity}</Text>
        <View style={styles.intensityRow}>
          {([1, 3, 5, 7, 10] as IntensityLevel[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.intensityChip, intensity === v && styles.intensityActive]}
              onPress={() => setIntensity(v)}
            >
              <Text style={[styles.intensityText, intensity === v && styles.intensityTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.subLabel, { marginTop: 12 }]}>발생 시각</Text>
        <DateTimePicker value={occurredAt} onChange={setOccurredAt} mode="time" />
      </Accordion>

      <Accordion title="장소 / 메모">
        <TextInput
          style={styles.input}
          placeholder="장소 (선택)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#B0B8C1"
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="메모 (선택)"
          value={memo}
          onChangeText={setMemo}
          placeholderTextColor="#B0B8C1"
          multiline
        />
      </Accordion>

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
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202632',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4E5968',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#202632',
    backgroundColor: '#FAFBFC',
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
