/**
 * SpeechBubble — TDS 갭 보완, 강아지 시점 메시지 (코칭 Block 3)
 * View + Shadow + Border 커스텀
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/tokens';
import { ICONS } from 'lib/data/iconSources';

export interface SpeechBubbleProps {
  message: string;
  emotion?: 'happy' | 'anxious' | 'confused' | 'hopeful' | 'tired';
}

const EMOTION_ICON: Record<string, string> = {
  happy: ICONS['ic-paw']!,
  anxious: ICONS['ic-cat-anxiety']!,
  confused: ICONS['ic-search']!,
  hopeful: ICONS['ic-target']!,
  tired: ICONS['ic-cat-rest']!,
};

export function SpeechBubble({ message, emotion = 'happy' }: SpeechBubbleProps) {
  const displayMessage =
    typeof message === 'string' && message.trim().length > 0
      ? message.trim()
      : '조금만 기다려 주세요.';

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.row}>
          <Image source={{ uri: EMOTION_ICON[emotion] ?? ICONS['ic-paw'] }} style={styles.emotionIcon} />
          <Text style={styles.message}>{displayMessage}</Text>
        </View>
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
  },
  bubble: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: spacing.lg,
    alignSelf: 'stretch',
    maxWidth: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  emotionIcon: {
    width: 22,
    height: 22,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textDark,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  tail: {
    width: 12,
    height: 12,
    backgroundColor: colors.surfaceSecondary,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
    marginLeft: spacing.lg,
  },
});
