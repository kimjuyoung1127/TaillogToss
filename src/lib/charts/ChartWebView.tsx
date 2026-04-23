/**
 * ChartWebView — WebView + Chart.js 기반 차트 렌더러
 * Radar, Heatmap, Line 차트를 HTML로 생성하여 WebView에 표시
 * onCapture: canvas.toDataURL → postMessage → RN 콜백
 * Parity: UI-001
 */
import React, { useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import WebView from '@granite-js/native/react-native-webview';

export type ChartType = 'radar' | 'heatmap' | 'line' | 'bar';

export interface ChartWebViewProps {
  type: ChartType;
  html: string;
  height?: number;
  onCapture?: (dataUrl: string) => void;
}

/** 차트 렌더 600ms 후 canvas dataURL을 postMessage로 전송 */
const CAPTURE_SCRIPT = `<script>(function(){setTimeout(function(){var c=document.querySelector('canvas');if(c&&window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'chartCapture',dataUrl:c.toDataURL('image/png')}));}},600);})();</script>`;

/**
 * WebView 차트 래퍼 — @granite-js/native/react-native-webview 사용
 * generateChartHTML.ts에서 생성한 HTML을 WebView로 렌더링
 */
export function ChartWebView({ html, height = 300, onCapture }: ChartWebViewProps) {
  const source = useMemo(
    () => ({ html: onCapture ? html + CAPTURE_SCRIPT : html }),
    [html, onCapture]
  );

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      if (!onCapture) return;
      try {
        const msg = JSON.parse(event.nativeEvent.data) as { type: string; dataUrl: string };
        if (msg.type === 'chartCapture' && msg.dataUrl) {
          onCapture(msg.dataUrl);
        }
      } catch {
        // JSON이 아닌 메시지는 무시
      }
    },
    [onCapture]
  );

  return (
    <WebView
      source={source}
      style={[styles.webview, { height }]}
      scrollEnabled={false}
      originWhitelist={['*']}
      javaScriptEnabled
      onMessage={onCapture ? handleMessage : undefined}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
