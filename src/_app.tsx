/**
 * TaillogToss 앱 컨테이너 — Granite.registerApp 엔트리
 * Parity: APP-001
 */
import React, { type PropsWithChildren } from 'react';
import { Granite, getSchemeUri, type InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';
import { QueryProvider } from 'stores/QueryProvider';
import { AuthProvider } from 'stores/AuthContext';
import { ActiveDogProvider } from 'stores/ActiveDogContext';
import { OrgProvider } from 'stores/OrgContext';
import { SurveyProvider } from 'stores/SurveyContext';
import { rewriteInitialUrlForDeepEntry } from 'lib/guards';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ActiveDogProvider>
          <OrgProvider>
            <SurveyProvider>{children}</SurveyProvider>
          </OrgProvider>
        </ActiveDogProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default Granite.registerApp(AppContainer, {
  appName: 'taillog-toss',
  context,
  getInitialUrl: async (initialScheme) => {
    const initialUrl = getSchemeUri();
    return rewriteInitialUrlForDeepEntry(initialUrl, initialScheme);
  },
});
