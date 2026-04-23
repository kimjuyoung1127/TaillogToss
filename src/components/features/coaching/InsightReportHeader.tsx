/**
 * InsightReportHeader — 인사이트 리포트 메타 카드
 * 생성일 · 분석 기간 · 기록 수 · 주요 행동 표시
 * Parity: AI-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from 'styles/tokens';
import type { CoachingResult } from 'types/coaching';

interface InsightReportHeaderProps {
  coaching: CoachingResult;
  dogName?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function InsightReportHeader({ coaching, dogName }: InsightReportHeaderProps) {
  const meta = coaching.analytics_metadata;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>📊</Text>
        <View>
          <Text style={styles.title}>{dogName ? `${dogName}의 ` : ''}심화 인사이트</Text>
          <Text style={styles.date}>{formatDate(coaching.created_at)}</Text>
        </View>
      </View>

      {meta && (
        <View style={styles.metaRow}>
          <MetaChip label="분석 기간" value={`${meta.analysis_days}일`} />
          <MetaChip label="기록 수" value={`${meta.log_count}건`} />
          {meta.top_behavior && (
            <MetaChip label="주요 행동" value={meta.top_behavior} />
          )}
        </View>
      )}
    </View>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blue50,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  date: {
    ...typography.caption,
    color: colors.grey600,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipValue: {
    ...typography.detail,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
});
