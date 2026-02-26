/**
 * ChartWebView — WebView + Chart.js 기반 차트 렌더러
 * Radar, Heatmap, Line 차트를 HTML로 생성하여 WebView에 표시
 * Parity: UI-001
 */
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

export type ChartType = 'radar' | 'heatmap' | 'line' | 'bar';

export interface ChartWebViewProps {
  type: ChartType;
  html: string;
  height?: number;
}

/**
 * WebView 차트 래퍼
 * @granite-js/native/react-native-webview 사용
 * TODO: 실제 WebView import는 @granite-js/native에서 가져옴
 */
export function ChartWebView({ type, html, height = 300 }: ChartWebViewProps) {
  void type;

  const source = useMemo(() => ({ html }), [html]);
  void source;

  // TODO: 실제 구현 — @granite-js/native/react-native-webview 연결
  // import { WebView } from '@granite-js/native/react-native-webview';
  // return <WebView source={source} style={{ height }} />;

  return (
    <View style={[styles.placeholder, { height }]}>
      {/* Phase 4 완료 후 WebView로 교체 */}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
