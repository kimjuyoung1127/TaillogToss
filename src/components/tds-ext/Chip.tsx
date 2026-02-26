/**
 * Chip / ChipGroup — TDS 갭 보완, TouchableOpacity + Badge 래퍼
 * 빠른 기록 카테고리 선택, 설문 옵션 등에 사용
 */
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected = false, onPress, disabled = false }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export interface ChipGroupProps {
  items: { key: string; label: string }[];
  selectedKeys: string[];
  onSelect: (key: string) => void;
  multiSelect?: boolean;
}

export function ChipGroup({ items, selectedKeys, onSelect, multiSelect: _multiSelect = false }: ChipGroupProps) {
  void _multiSelect; // TODO: Phase 6에서 다중 선택 로직 구현
  const handlePress = (key: string) => {
    onSelect(key);
  };

  return (
    <View style={styles.group}>
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          selected={selectedKeys.includes(item.key)}
          onPress={() => handlePress(item.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F4F5',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#0064FF',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 14,
    color: '#4E5968',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
