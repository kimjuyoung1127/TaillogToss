/**
 * DateTimePicker — TDS 갭 보완, SegmentedControl 조합
 * 기록 발생 시각 선택에 사용 (네이티브 DatePicker 불가 → 커스텀)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export function DateTimePicker({ value, onChange, mode = 'datetime' }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState(value);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleHourSelect = (hour: number) => {
    const next = new Date(selectedDate);
    next.setHours(hour);
    setSelectedDate(next);
    onChange(next);
  };

  const handleMinuteSelect = (minute: number) => {
    const next = new Date(selectedDate);
    next.setMinutes(minute);
    setSelectedDate(next);
    onChange(next);
  };

  const quickOptions = [
    { label: '방금', offset: 0 },
    { label: '30분 전', offset: -30 },
    { label: '1시간 전', offset: -60 },
    { label: '2시간 전', offset: -120 },
  ];

  const handleQuickSelect = (offsetMinutes: number) => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + offsetMinutes);
    setSelectedDate(next);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.quickRow}>
        {quickOptions.map((opt) => (
          <TouchableOpacity key={opt.label} style={styles.quickChip} onPress={() => handleQuickSelect(opt.offset)}>
            <Text style={styles.quickText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {(mode === 'time' || mode === 'datetime') && (
        <View style={styles.pickerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {hours.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.cell, selectedDate.getHours() === h && styles.cellSelected]}
                onPress={() => handleHourSelect(h)}
              >
                <Text style={[styles.cellText, selectedDate.getHours() === h && styles.cellTextSelected]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.separator}>:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {minutes.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.cell, selectedDate.getMinutes() === m && styles.cellSelected]}
                onPress={() => handleMinuteSelect(m)}
              >
                <Text style={[styles.cellText, selectedDate.getMinutes() === m && styles.cellTextSelected]}>
                  {String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F4F4F5',
    borderRadius: 16,
    marginRight: 8,
  },
  quickText: {
    fontSize: 13,
    color: '#4E5968',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  cell: {
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  cellSelected: {
    backgroundColor: '#0064FF',
  },
  cellText: {
    fontSize: 14,
    color: '#4E5968',
  },
  cellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  separator: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333D4B',
    marginHorizontal: 4,
  },
});
