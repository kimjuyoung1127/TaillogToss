/**
 * TaillogToss 앱 컨테이너 — Granite.registerApp 엔트리
 * Parity: APP-001
 */
import React, { type PropsWithChildren } from 'react';
import { Granite, type InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <>{children}</>;
}

export default Granite.registerApp(AppContainer, {
  appName: 'taillog-toss',
  context,
});
