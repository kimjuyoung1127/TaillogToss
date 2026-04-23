/**
 * 인사이트 리포트 화면 — Pro 전용
 * 6블록 코칭 결과를 하나의 심화 리포트로 통합 제공
 * DetailLayout (패턴B) — featureGuard(proOnly)
 * Parity: AI-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { colors, spacing } from 'styles/tokens';
import { DetailLayout } from 'components/shared/layouts/DetailLayout';
import { InsightReportHeader } from 'components/features/coaching/InsightReportHeader';
import { InsightBlockView, ActionPlanBlockView, DogVoiceBlockView } from 'components/features/coaching/FreeBlock';
import {
  UnlockedBlock,
  Next7DaysView,
  RiskSignalsView,
  ConsultationView,
} from 'components/features/coaching/LockedBlock';
import { EmptyState } from 'components/tds-ext/EmptyState';
import { ErrorState } from 'components/tds-ext/ErrorState';
import { SkeletonCoaching } from 'components/features/coaching/SkeletonCoaching';
import { useInsightReport } from 'lib/hooks/useInsightReport';
import { featureGuard } from 'lib/guards/featureGuard';
import { useIsPro } from 'lib/hooks/useSubscription';
import { usePageGuard } from 'lib/hooks/usePageGuard';
import { useActiveDog } from 'stores/ActiveDogContext';
import { useAuth } from 'stores/AuthContext';

export const Route = createRoute('/coaching/insights', {
  validateParams: (params) => params as { coachingId?: string },
  component: InsightReportPage,
  screenOptions: { headerShown: false },
});

function InsightReportPage() {
  const { user } = useAuth();
  const { activeDog } = useActiveDog();
  const isPro = useIsPro(user?.id);
  const navigation = useNavigation();
  const { isReady } = usePageGuard({ currentPath: '/coaching/insights' });

  const { coachingId } = Route.useParams();
  const { coaching, isLoading, isError, refetch } = useInsightReport(activeDog?.id, coachingId);

  const guard = featureGuard({ requirement: 'proOnly', isPro: isPro ?? false, dogCount: 0 });

  if (!isReady) return null;

  if (!guard.allow) {
    navigation.navigate(guard.redirectTo as '/settings/subscription');
    return null;
  }

  if (isLoading) {
    return (
      <DetailLayout title="심화 인사이트" onBack={() => navigation.goBack()}>
        <SkeletonCoaching />
      </DetailLayout>
    );
  }

  if (isError) {
    return (
      <DetailLayout title="심화 인사이트" onBack={() => navigation.goBack()}>
        <ErrorState title="리포트를 불러오지 못했어요" onRetry={refetch} />
      </DetailLayout>
    );
  }

  if (!coaching) {
    return (
      <DetailLayout title="심화 인사이트" onBack={() => navigation.goBack()}>
        <EmptyState
          title="코칭 결과가 없어요"
          description="AI 코칭을 먼저 받아보세요"
        />
      </DetailLayout>
    );
  }

  return (
    <DetailLayout title="심화 인사이트" onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InsightReportHeader coaching={coaching} dogName={activeDog?.name} />

        <InsightBlockView data={coaching.blocks.insight} />
        <ActionPlanBlockView data={coaching.blocks.action_plan} />
        <DogVoiceBlockView
          data={coaching.blocks.dog_voice}
          dogName={activeDog?.name}
          dogImageUrl={activeDog?.profile_image_url ?? null}
        />

        <UnlockedBlock blockKey="next_7_days">
          <Next7DaysView data={coaching.blocks.next_7_days} />
        </UnlockedBlock>

        <UnlockedBlock blockKey="risk_signals">
          <RiskSignalsView data={coaching.blocks.risk_signals} />
        </UnlockedBlock>

        <UnlockedBlock blockKey="consultation_questions">
          <ConsultationView data={coaching.blocks.consultation_questions} />
        </UnlockedBlock>

        <View style={styles.bottomPad} />
      </ScrollView>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screenHorizontal,
    backgroundColor: colors.background,
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
