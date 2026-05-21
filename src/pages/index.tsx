/**
 * 루트 라우트 — 앱 기본 진입 시 welcome 화면으로 리다이렉트한다.
 * Parity: APP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { colors, typography } from 'styles/tokens';
import { useAuth } from 'stores/AuthContext';
import { isB2BAuthRole } from 'stores/authRole';

export const Route = createRoute('/', {
  component: RootEntryPage,
  screenOptions: { headerShown: false },
});

function RootEntryPage() {
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
      <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>앱을 준비하고 있어요</Text>
    </View>
  );
}
