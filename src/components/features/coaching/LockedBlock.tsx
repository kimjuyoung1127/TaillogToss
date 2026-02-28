/**
 * LockedBlock — PRO 잠금 블록 ④⑤⑥ (next_7_days, risk_signals, consultation_questions)
 * Skeleton 블러 + RewardedAdButton으로 해제
 * Parity: AI-001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Next7DaysBlock, RiskSignalsBlock, ConsultationQuestionsBlock } from 'types/coaching';
import { colors, typography } from 'styles/tokens';

const BLOCK_META: Record<string, { label: string; icon: string; teaser: string }> = {
  next_7_days: {
    label: '7일 맞춤 플랜',
    icon: '📅',
    teaser: '다음 7일간 해야 할 구체적인 훈련 계획을 확인하세요',
  },
  risk_signals: {
    label: '위험 신호 분석',
    icon: '⚠️',
    teaser: '놓치고 있는 행동 위험 신호를 AI가 분석했습니다',
  },
  consultation_questions: {
    label: '전문가 상담 질문',
    icon: '👨‍⚕️',
    teaser: '수의사/훈련사에게 꼭 물어볼 맞춤 질문을 준비했습니다',
  },
};

interface LockedBlockProps {
  blockKey: 'next_7_days' | 'risk_signals' | 'consultation_questions';
}

export function LockedBlock({ blockKey }: LockedBlockProps) {
  const meta = BLOCK_META[blockKey]!;

  return (
    <View style={styles.card}>
      <Text style={styles.blockLabel}>{meta.label}</Text>
      <View style={styles.lockOverlay}>
        <Text style={styles.lockIcon}>{meta.icon}</Text>
        <Text style={styles.lockTitle}>{meta.label}</Text>
        <Text style={styles.lockTeaser}>{meta.teaser}</Text>

        {/* Skeleton 블러 효과 */}
        <View style={styles.skeletonGroup}>
          <View style={[styles.skeleton, { width: '90%' }]} />
          <View style={[styles.skeleton, { width: '75%' }]} />
          <View style={[styles.skeleton, { width: '85%' }]} />
          <View style={[styles.skeleton, { width: '60%' }]} />
        </View>

        <View style={styles.blurOverlay}>
          <Text style={styles.blurIcon}>🔒</Text>
          <Text style={styles.blurText}>PRO 전용 콘텐츠</Text>
        </View>
      </View>
    </View>
  );
}

/** 잠금 해제된 PRO 블록 렌더링 */
export function UnlockedBlock({ blockKey, children }: { blockKey: string; children: React.ReactNode }) {
  const meta = BLOCK_META[blockKey];
  return (
    <View style={styles.card}>
      <Text style={styles.blockLabel}>{meta?.label ?? blockKey}</Text>
      {children}
    </View>
  );
}

// ──────────────────────────────────────
// PRO 블록 콘텐츠 뷰 (잠금 해제 시)
// ──────────────────────────────────────

export function Next7DaysView({ data }: { data: Next7DaysBlock }) {
  return (
    <View>
      {data.days.map((day) => (
        <View key={day.day_number} style={styles.dayRow}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayNumber}>Day {day.day_number}</Text>
          </View>
          <View style={styles.dayContent}>
            <Text style={styles.dayFocus}>{day.focus}</Text>
            {day.tasks.map((task, i) => (
              <Text key={i} style={styles.dayTask}>{'• '}{task}</Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const SEVERITY_COLOR: Record<string, string> = {
  low: colors.green500,
  medium: colors.orange500,
  high: colors.red500,
  critical: colors.red700,
};

export function RiskSignalsView({ data }: { data: RiskSignalsBlock }) {
  return (
    <View>
      <View style={[styles.riskOverall, { backgroundColor: SEVERITY_COLOR[data.overall_risk] + '1A' }]}>
        <Text style={[styles.riskOverallText, { color: SEVERITY_COLOR[data.overall_risk] }]}>
          전체 위험도: {data.overall_risk.toUpperCase()}
        </Text>
      </View>
      {data.signals.map((signal, idx) => (
        <View key={idx} style={styles.signalRow}>
          <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[signal.severity] }]} />
          <View style={styles.signalContent}>
            <Text style={styles.signalType}>{signal.type}</Text>
            <Text style={styles.signalDesc}>{signal.description}</Text>
            <Text style={styles.signalRec}>{signal.recommendation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ConsultationView({ data }: { data: ConsultationQuestionsBlock }) {
  const specialistLabel: Record<string, string> = {
    behaviorist: '행동 전문가',
    trainer: '훈련사',
    vet: '수의사',
  };

  return (
    <View>
      {data.recommended_specialist && (
        <View style={styles.specialistBadge}>
          <Text style={styles.specialistText}>
            추천 전문가: {specialistLabel[data.recommended_specialist]}
          </Text>
        </View>
      )}
      {data.questions.map((q, idx) => (
        <View key={idx} style={styles.questionRow}>
          <Text style={styles.questionNumber}>{idx + 1}</Text>
          <Text style={styles.questionText}>{q}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  blockLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  lockOverlay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockTitle: {
    ...typography.label,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  lockTeaser: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  skeletonGroup: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  skeleton: {
    height: 14,
    backgroundColor: colors.divider,
    borderRadius: 7,
  },
  blurOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  blurIcon: {
    ...typography.detail,
    marginRight: 6,
  },
  blurText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  // Day plan styles
  dayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayBadge: {
    backgroundColor: colors.primaryBlueLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  dayContent: {
    flex: 1,
  },
  dayFocus: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  dayTask: {
    ...typography.caption,
    lineHeight: 20,
    color: colors.grey600,
  },
  // Risk styles
  riskOverall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  riskOverallText: {
    ...typography.detail,
    fontWeight: '700',
  },
  signalRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  signalContent: {
    flex: 1,
  },
  signalType: {
    ...typography.detail,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  signalDesc: {
    ...typography.caption,
    color: colors.grey600,
    marginBottom: 4,
  },
  signalRec: {
    ...typography.caption,
    color: colors.primaryBlue,
    fontWeight: '500',
  },
  // Consultation styles
  specialistBadge: {
    backgroundColor: colors.primaryBlueLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  specialistText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryBlue,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.divider,
    textAlign: 'center',
    ...typography.caption,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.grey600,
    marginRight: 10,
  },
  questionText: {
    flex: 1,
    ...typography.detail,
    lineHeight: 21,
    color: colors.textDark,
  },
});
