/**
 * 404 라우트 — 알 수 없는 경로 진입 시 welcome으로 리다이렉트한다.
 * Parity: APP-001
 */
import { createRoute, useNavigation } from '@granite-js/react-native';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export const Route = createRoute('/_404' as '/', {
  component: NotFoundPage,
  screenOptions: { headerShown: false },
});

function NotFoundPage() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.navigate('/onboarding/welcome');
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>404 Not Found</Text>
    </View>
  );
}
