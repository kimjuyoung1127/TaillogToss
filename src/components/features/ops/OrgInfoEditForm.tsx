/**
 * OrgInfoEditForm — 센터 기본 정보 표시 + 수정 폼
 * Display Mode: 정보 행 + "수정" 버튼
 * Edit Mode: TextInput 3개 (이름/전화/주소) + 저장/취소
 * Parity: B2B-002
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from 'styles/tokens';
import type { Organization, OrgType } from 'types/b2b';

const ORG_TYPE_LABEL: Record<OrgType, string> = {
  daycare: '반려견 유치원',
  hotel: '반려견 호텔',
  training_center: '훈련 센터',
  hospital: '동물병원',
};

interface OrgInfoEditFormProps {
  org: Organization;
  isLoading?: boolean;
  onSave: (updates: Pick<Organization, 'name' | 'phone' | 'address'>) => void;
}

export function OrgInfoEditForm({ org, isLoading, onSave }: OrgInfoEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const [phone, setPhone] = useState(org.phone ?? '');
  const [address, setAddress] = useState(org.address ?? '');

  // org 변경 시 폼 동기화
  useEffect(() => {
    if (!editing) {
      setName(org.name);
      setPhone(org.phone ?? '');
      setAddress(org.address ?? '');
    }
  }, [org, editing]);

  const handleCancel = () => {
    setName(org.name);
    setPhone(org.phone ?? '');
    setAddress(org.address ?? '');
    setEditing(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
    });
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>센터 정보</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.7}>
            <Text style={styles.editBtn}>수정</Text>
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View>
          <Text style={styles.label}>센터 이름 *</Text>
          <TextInput
            style={[styles.input, !name.trim() && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="센터 이름"
            placeholderTextColor={colors.textTertiary}
            maxLength={40}
          />

          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="예: 02-1234-5678 (선택)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            maxLength={20}
          />

          <Text style={styles.label}>주소</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="예: 서울 강남구 (선택)"
            placeholderTextColor={colors.textTertiary}
            maxLength={80}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || isLoading) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!name.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Text style={styles.saveBtnText}>저장</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <InfoRow label="이름" value={org.name} />
          <InfoRow label="유형" value={ORG_TYPE_LABEL[org.type] ?? org.type} />
          <InfoRow label="전화번호" value={org.phone ?? '—'} />
          <InfoRow label="주소" value={org.address ?? '—'} />
        </View>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.label, fontWeight: '700', color: colors.textPrimary },
  editBtn: { ...typography.detail, fontWeight: '600', color: colors.primaryBlue },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceTertiary,
  },
  infoLabel: { ...typography.detail, color: colors.badgeGrey },
  infoValue: { ...typography.detail, fontWeight: '600', color: colors.textPrimary, flexShrink: 1, textAlign: 'right', marginLeft: spacing.sm },
  label: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodySmall,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.red500 },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.primaryBlue,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: colors.grey300 },
  saveBtnText: { ...typography.bodySmall, fontWeight: '700', color: colors.white },
});
