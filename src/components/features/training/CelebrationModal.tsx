/**
 * 커리큘럼 완료 축하 모달 — Lottie + 아카데미 복귀 CTA
 * Parity: UI-001
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LottieAnimation } from 'components/shared/LottieAnimation';
import { colors, typography, spacing } from 'styles/tokens';

interface Props {
  visible: boolean;
  curriculumTitle: string;
  onClose: () => void;
  onCoaching: () => void;
}

export function CelebrationModal({ visible, curriculumTitle, onClose, onCoaching }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LottieAnimation asset="cute-doggie" size={120} loop={false} />
          <Text style={styles.title}>축하합니다!</Text>
          <Text style={styles.description}>
            {curriculumTitle} 커리큘럼을 모두 완료했어요!
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>아카데미로 돌아가기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.coachingCTA} onPress={onCoaching} activeOpacity={0.7}>
            <Text style={styles.coachingCTAText}>새로운 AI 코칭 받아보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  title: {
    ...typography.pageTitle,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    ...typography.bodySmall,
    color: colors.grey700,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.white,
  },
  coachingCTA: {
    marginTop: spacing.md,
    paddingVertical: 10,
  },
  coachingCTAText: {
    ...typography.bodySmall,
    color: colors.primaryBlue,
    fontWeight: '500',
  },
});
