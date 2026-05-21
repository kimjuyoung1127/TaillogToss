/**
 * 404 라우트 — 알 수 없는 경로 진입 시 welcome으로 리다이렉트한다.
 * Parity: APP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { useAuth } from 'stores/AuthContext';
import { isB2BAuthRole } from 'stores/authRole';

export const Route = createRoute('/_404' as '/', {
  component: NotFoundPage,
  screenOptions: { headerShown: false },
});

function NotFoundPage() {
  const navigation = useNavigation();
  const { user, isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const target = isAuthenticated
      ? isB2BAuthRole(user?.role)
        ? '/ops/today'
        : hasCompletedOnboarding
          ? '/dashboard'
          : '/onboarding/welcome'
      : '/onboarding/welcome';
    const timer = setTimeout(() => navigation.navigate(target as never), 0);
    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, isAuthenticated, isLoading, navigation, user?.role]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>시작 화면으로 돌아가고 있어요</Text>
    </View>
  );
}
