/**
 * 차트 데이터 타입 — Radar/Heatmap/Bar/Line (WebView + Chart.js)
 * Parity: UI-001
 */

/** Radar 차트 데이터 (5축) */
export interface RadarChartData {
  labels: [string, string, string, string, string]; // 5축 라벨
  datasets: RadarDataset[];
}

export interface RadarDataset {
  label: string;
  data: [number, number, number, number, number]; // 각 축 0-100
  backgroundColor?: string;
  borderColor?: string;
}

/** Heatmap 차트 데이터 (요일 x 시간) */
export interface HeatmapData {
  /** 7(요일) x 24(시간) 매트릭스 */
  matrix: number[][];
  /** 요일 라벨 */
  day_labels: string[]; // ['월', '화', '수', '목', '금', '토', '일']
  /** 시간 라벨 */
  hour_labels: string[]; // ['00', '01', ..., '23']
  /** 값 범위 */
  min_value: number;
  max_value: number;
}

/** Bar 차트 데이터 */
export interface BarChartData {
  labels: string[];
  datasets: BarDataset[];
}

export interface BarDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
}

/** Line 차트 데이터 */
export interface LineChartData {
  labels: string[];
  datasets: LineDataset[];
}

export interface LineDataset {
  label: string;
  data: number[];
  borderColor?: string;
  fill?: boolean;
}

/** 차트 기간 필터 */
export type ChartPeriod = 'weekly' | 'monthly' | 'all';
