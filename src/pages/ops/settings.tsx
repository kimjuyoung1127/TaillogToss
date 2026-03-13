/**
 * Ops 설정 — 조직 정보, 직원 관리, 프리셋 관리, 통계
 * Parity: B2B-001
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { createRoute, useNavigation } from '@granite-js/react-native';
import { ErrorState } from 'components/tds-ext';
import { usePageGuard } from 'lib/hooks/usePageGuard';
import { useOrg } from 'stores/OrgContext';
import { useOrgMembers, useInviteMember, useOrgTodayStats } from 'lib/hooks/useOrg';
import { useOrgEntitlement } from 'lib/hooks/useOrgSubscription';
import { MemberList } from 'components/features/ops/MemberList';
import { InviteSheet } from 'components/features/ops/InviteSheet';
import { OrgStatsSheet } from 'components/features/ops/OrgStatsSheet';
import { PresetManager } from 'components/features/ops/PresetManager';
import type { OrgMemberRole } from 'types/b2b';

export const Route = createRoute('/ops/settings', { component: OpsSettingsPage });

function OpsSettingsPage() {
  const { isReady } = usePageGuard({
    currentPath: '/ops/settings' as any,
    requireFeature: 'b2bOnly',
  });
  const navigation = useNavigation();
  const { org } = useOrg();
  const { data: members, isLoading: membersLoading, isError: membersError, refetch: refetchMembers } = useOrgMembers(org?.id);
  const { data: todayStats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useOrgTodayStats(org?.id);

  const isLoading = membersLoading || statsLoading;
  const isError = membersError || statsError;
  const refetchAll = useCallback(() => { void refetchMembers(); void refetchStats(); }, [refetchMembers, refetchStats]);
  const entitlement = useOrgEntitlement(org?.id);
  const inviteMember = useInviteMember(entitlement.maxStaff);

  const [showInvite, setShowInvite] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleInvite = useCallback((userId: string, role: OrgMemberRole) => {
    if (!org) return;
    inviteMember.mutate({ org_id: org.id, user_id: userId, role });
    setShowInvite(false);
  }, [org, inviteMember]);

  if (!isReady) return null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backBtn}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>운영 설정</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backBtn}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>운영 설정</Text>
          <View style={styles.navSpacer} />
        </View>
        <ErrorState onRetry={refetchAll} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtn}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>운영 설정</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView style={styles.body}>
        {/* 조직 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조직 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{org?.name ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>유형</Text>
            <Text style={styles.infoValue}>{org?.type ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>최대 강아지</Text>
            <Text style={styles.infoValue}>{org?.max_dogs ?? 0}마리</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>최대 직원</Text>
            <Text style={styles.infoValue}>{org?.max_staff ?? 0}명</Text>
          </View>
        </View>

        {/* 직원 관리 */}
        <MemberList
          members={members ?? []}
          onInvite={() => setShowInvite(true)}
        />

        {/* 통계 */}
        <TouchableOpacity style={styles.statsBtn} onPress={() => setShowStats(true)} activeOpacity={0.7}>
          <Text style={styles.statsBtnText}>운영 통계 보기</Text>
        </TouchableOpacity>

        {/* 프리셋 관리 */}
        <PresetManager />
      </ScrollView>

      {/* 초대 모달 */}
      <Modal visible={showInvite} animationType="slide" presentationStyle="pageSheet">
        <InviteSheet onInvite={handleInvite} onClose={() => setShowInvite(false)} />
      </Modal>

      {/* 통계 모달 */}
      <Modal visible={showStats} animationType="slide" presentationStyle="pageSheet">
        <OrgStatsSheet stats={todayStats ?? null} onClose={() => setShowStats(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navbar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  backBtn: { ...typography.pageTitle, color: colors.textPrimary, paddingRight: 8 },
  navTitle: { flex: 1, ...typography.subtitle, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  navSpacer: { width: 30 },
  body: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { ...typography.label, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F2F3F5',
  },
  infoLabel: { ...typography.detail, color: '#6B7280' },
  infoValue: { ...typography.detail, fontWeight: '600', color: colors.textPrimary },
  statsBtn: {
    marginHorizontal: 20, marginVertical: 16,
    backgroundColor: colors.divider, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  statsBtnText: { ...typography.bodySmall, fontWeight: '600', color: '#374151' },
});
