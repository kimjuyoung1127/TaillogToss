/**
 * FreeBlock — 무료 코칭 블록 ①②③ (insight, action_plan, dog_voice)
 * Parity: AI-001
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { InsightBlock, ActionPlanBlock, DogVoiceBlock } from 'types/coaching';
import { SpeechBubble } from 'components/tds-ext/SpeechBubble';
import { colors, typography } from 'styles/tokens';

// ──────────────────────────────────────
// Block ①: 행동 분석 인사이트
// ──────────────────────────────────────

const TREND_LABEL: Record<string, string> = {
  improving: '개선 중',
  stable: '유지 중',
  worsening: '주의 필요',
};

const TREND_COLOR: Record<string, string> = {
  improving: colors.green500,
  stable: colors.textSecondary,
  worsening: colors.red500,
};

export function InsightBlockView({ data }: { data: InsightBlock }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.blockLabel}>행동 분석</Text>
        <View style={[styles.trendBadge, { backgroundColor: TREND_COLOR[data.trend] + '1A' }]}>
          <Text style={[styles.trendText, { color: TREND_COLOR[data.trend] }]}>
            {TREND_LABEL[data.trend]}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{data.title}</Text>
      <Text style={styles.cardBody}>{data.summary}</Text>
      {data.key_patterns.length > 0 && (
        <View style={styles.patternList}>
          {data.key_patterns.map((pattern, idx) => (
            <View key={idx} style={styles.patternItem}>
              <Text style={styles.patternDot}>{'•'}</Text>
              <Text style={styles.patternText}>{pattern}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ──────────────────────────────────────
// Block ②: 실행 계획
// ──────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  high: colors.red500,
  medium: colors.orange500,
  low: colors.green500,
};

const PRIORITY_LABEL: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export function ActionPlanBlockView({
  data,
  onToggleItem,
}: {
  data: ActionPlanBlock;
  onToggleItem?: (itemId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.blockLabel}>실행 계획</Text>
      <Text style={styles.cardTitle}>{data.title}</Text>
      {data.items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.actionItem}
          onPress={() => onToggleItem?.(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.checkbox}>{item.is_completed ? '☑' : '☐'}</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionText, item.is_completed && styles.completed]}>
              {item.description}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLOR[item.priority] + '1A' }]}>
              <Text style={[styles.priorityText, { color: PRIORITY_COLOR[item.priority] }]}>
                {PRIORITY_LABEL[item.priority]}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ──────────────────────────────────────
// Block ③: 강아지 시점 메시지
// ──────────────────────────────────────

export function DogVoiceBlockView({ data }: { data: DogVoiceBlock }) {
  return (
    <View style={styles.card}>
      <Text style={styles.blockLabel}>강아지의 마음</Text>
      <SpeechBubble message={data.message} emotion={data.emotion} />
    </View>
  );
}

// ──────────────────────────────────────
// Styles
// ──────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.grey700,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patternList: {
    marginTop: 12,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  patternDot: {
    ...typography.detail,
    color: colors.primaryBlue,
    marginRight: 8,
  },
  patternText: {
    ...typography.detail,
    color: colors.grey700,
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  checkbox: {
    ...typography.subtitle,
    marginRight: 12,
    color: colors.primaryBlue,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.textDark,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
