/**
 * TaillogToss Granite 설정 — 파일 기반 라우팅 + Hermes 엔진
 * Parity: APP-001
 */
import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'taillog-toss',
  scheme: 'granite',
  plugins: [router(), hermes()],
});
