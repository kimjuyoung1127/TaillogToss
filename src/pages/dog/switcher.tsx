/**
 * 반려견 전환 화면 — Bottom Sheet List 레이아웃 (멀티독 선택)
 * Parity: APP-001
 */
import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { usePageGuard } from 'lib/hooks/usePageGuard';
import { useAuth } from 'stores/AuthContext';
import { useDogList } from 'lib/hooks/useDogs';
import { EmptyState, ErrorState } from 'components/tds-ext';

export const Route = createRoute('/dog/switcher', {
  component: DogSwitcherPage,
});

function DogSwitcherPage() {
  const { isReady } = usePageGuard({ currentPath: '/dog/switcher' });
  const { user } = useAuth();
  const { data: dogs, isLoading, isError, refetch } = useDogList(user?.id);

  if (!isReady) return null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState onRetry={() => void refetch()} />
      </View>
    );
  }

  if (!dogs || dogs.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="반려견을 등록해보세요"
          description="반려견 정보를 등록하면 맞춤 코칭을 받을 수 있어요"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dog Switcher</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  text: { ...typography.subtitle, color: colors.textPrimary },
});
