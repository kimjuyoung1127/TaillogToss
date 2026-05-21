/**
 * BulkActionBar — 벌크 모드 상단 바 (선택 건수 + 일괄 저장 CTA)
 * Parity: B2B-001
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from 'styles/tokens';

interface BulkActionBarProps {
  selectedCount: number;
  onAssignMine?: () => void;
  onUnassignMine?: () => void;
  onBulkRecord: () => void;
  onCancel: () => void;
  isAssigning?: boolean;
  isUnassigning?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onAssignMine,
  onUnassignMine,
  onBulkRecord,
  onCancel,
  isAssigning = false,
  isUnassigning = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
        <Text style={styles.cancelText}>취소</Text>
      </TouchableOpacity>
      <Text style={styles.countText}>{selectedCount}마리 선택</Text>
      <View style={styles.actions}>
        {onAssignMine ? (
          <TouchableOpacity
            style={[styles.assignBtn, isAssigning && styles.disabledBtn]}
            onPress={onAssignMine}
            disabled={isAssigning}
            activeOpacity={0.8}
          >
            <Text style={styles.assignBtnText}>{isAssigning ? '추가 중' : '내 담당 추가'}</Text>
          </TouchableOpacity>
        ) : onUnassignMine ? (
          <TouchableOpacity
            style={[styles.removeBtn, isUnassigning && styles.disabledBtn]}
            onPress={onUnassignMine}
            disabled={isUnassigning}
            activeOpacity={0.8}
          >
            <Text style={styles.removeBtnText}>{isUnassigning ? '해제 중' : '내 담당 해제'}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.bulkBtn} onPress={onBulkRecord} activeOpacity={0.8}>
          <Text style={styles.bulkBtnText}>일괄 기록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primaryBlueLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue200,
  },
  cancelText: {
    ...typography.detail,
    color: colors.grey600,
    fontWeight: '500',
  },
  countText: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  assignBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  removeBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.grey700,
  },
  bulkBtn: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
});
