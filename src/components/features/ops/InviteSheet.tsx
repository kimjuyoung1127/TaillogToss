/**
 * InviteSheet — 직원 초대 바텀시트
 * Parity: B2B-001
 */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography } from 'styles/tokens';
import type { OrgMemberRole } from 'types/b2b';

const ROLE_OPTIONS: { key: OrgMemberRole; label: string }[] = [
  { key: 'staff', label: '직원' },
  { key: 'manager', label: '관리자' },
  { key: 'viewer', label: '열람자' },
];

interface InviteSheetProps {
  onInvite: (userId: string, role: OrgMemberRole) => void;
  onClose: () => void;
}

export function InviteSheet({ onInvite, onClose }: InviteSheetProps) {
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<OrgMemberRole>('staff');

  const handleInvite = useCallback(() => {
    if (userId.trim()) {
      onInvite(userId.trim(), selectedRole);
    }
  }, [userId, selectedRole, onInvite]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>직원 초대</Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtn}>{'\u2715'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>사용자 ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="초대할 사용자 ID 입력"
          autoCapitalize="none"
        />

        <Text style={styles.label}>역할</Text>
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.roleChip, selectedRole === opt.key && styles.roleChipActive]}
              onPress={() => setSelectedRole(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.roleText, selectedRole === opt.key && styles.roleTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.inviteBtn, !userId.trim() && styles.inviteBtnDisabled]}
          onPress={handleInvite}
          disabled={!userId.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.inviteBtnText}>초대</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...typography.subtitle, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { ...typography.sectionTitle, color: colors.textSecondary, padding: 4 },
  body: { padding: 20 },
  label: { ...typography.detail, fontWeight: '600', color: colors.textDark, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, ...typography.detail, marginBottom: 20,
  },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.divider, borderWidth: 1, borderColor: colors.border,
  },
  roleChipActive: { backgroundColor: colors.primaryBlueLight, borderColor: colors.primaryBlue },
  roleText: { ...typography.detail, color: colors.grey600 },
  roleTextActive: { color: colors.primaryBlue, fontWeight: '600' },
  footer: { padding: 20 },
  inviteBtn: {
    backgroundColor: colors.primaryBlue, borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  inviteBtnDisabled: { opacity: 0.5 },
  inviteBtnText: { ...typography.bodySmall, fontWeight: '600', color: colors.white },
});
