/**
 * Chart.js HTML 생성기 — WebView에 주입할 HTML 문자열 생성
 * Radar, Heatmap, Line, Bar 차트 지원
 * Parity: UI-001
 */
import type { RadarChartData, HeatmapData, BarChartData, LineChartData } from 'types/chart';

const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

/** 공통 HTML 래퍼 */
function wrapHTML(chartScript: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="${CHART_JS_CDN}"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; display: flex; align-items: center; justify-content: center; }
    canvas { max-width: 100%; }
  </style>
</head>
<body>
  <canvas id="chart"></canvas>
  <script>${chartScript}</script>
</body>
</html>`;
}

/** Radar 차트 HTML */
export function generateRadarHTML(data: RadarChartData): string {
  const config = {
    type: 'radar',
    data: {
      labels: data.labels,
      datasets: data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor ?? 'rgba(0, 100, 255, 0.2)',
        borderColor: ds.borderColor ?? '#0064FF',
        borderWidth: 2,
        pointBackgroundColor: ds.borderColor ?? '#0064FF',
      })),
    },
    options: {
      responsive: true,
      scales: {
        r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
      },
      plugins: { legend: { display: false } },
    },
  };
  return wrapHTML(`
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, ${JSON.stringify(config)});
  `);
}

/** Heatmap 차트 HTML (matrix plugin 또는 순수 canvas) */
export function generateHeatmapHTML(data: HeatmapData): string {
  const script = `
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');
    const matrix = ${JSON.stringify(data.matrix)};
    const days = ${JSON.stringify(data.day_labels)};
    const hours = ${JSON.stringify(data.hour_labels)};
    const maxVal = ${data.max_value};

    const cellW = 20, cellH = 20, padL = 30, padT = 20;
    canvas.width = padL + hours.length * cellW + 10;
    canvas.height = padT + days.length * cellH + 10;

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    hours.forEach((h, i) => {
      if (i % 3 === 0) ctx.fillText(h, padL + i * cellW + cellW/2, 12);
    });
    days.forEach((d, i) => {
      ctx.textAlign = 'right';
      ctx.fillText(d, padL - 4, padT + i * cellH + cellH/2 + 3);
    });

    matrix.forEach((row, ri) => {
      row.forEach((val, ci) => {
        const intensity = maxVal > 0 ? val / maxVal : 0;
        ctx.fillStyle = 'rgba(0, 100, 255, ' + (0.1 + intensity * 0.8) + ')';
        ctx.fillRect(padL + ci * cellW, padT + ri * cellH, cellW - 1, cellH - 1);
      });
    });
  `;
  return wrapHTML(script);
}

/** Bar 차트 HTML */
export function generateBarHTML(data: BarChartData): string {
  const config = {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor ?? '#0064FF',
      })),
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  };
  return wrapHTML(`
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, ${JSON.stringify(config)});
  `);
}

/** Line 차트 HTML */
export function generateLineHTML(data: LineChartData): string {
  const config = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor ?? '#0064FF',
        fill: ds.fill ?? false,
        tension: 0.3,
      })),
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  };
  return wrapHTML(`
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, ${JSON.stringify(config)});
  `);
}
