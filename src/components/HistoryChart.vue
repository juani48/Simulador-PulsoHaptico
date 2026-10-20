<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';
import type { HistoryPoint } from '../types';

ChartJS.register(LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend, Filler);

const props = defineProps<{
  history: HistoryPoint[];
  socialBattery: number;
  dateTime?: string;
  currentActivity?: string;
}>();

const labels = computed(() => props.history.map(p =>
  new Date(p.t).toLocaleTimeString('es-AR', { hour12: false })));
const latestTimestamp = computed(() => props.dateTime || props.history.at(-1)?.t);
const displayDate = computed(() => latestTimestamp.value
  ? new Date(latestTimestamp.value).toLocaleDateString('es-AR')
  : '—');
const displayTime = computed(() => latestTimestamp.value
  ? new Date(latestTimestamp.value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  : '—');

const pulseChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Pulso',
      data: props.history.map(p => p.pulse),
      borderColor: '#4b54a5',
      backgroundColor: 'rgba(75,84,165,.10)',
      tension: .35, fill: true, pointRadius: 0
    }
  ]
}));

const noiseChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Nivel de ruido',
      data: props.history.map(p => p.noiseLevel),
      borderColor: '#292f78',
      backgroundColor: 'rgba(41,47,120,.08)',
      tension: .35, fill: true, pointRadius: 0
    }
  ]
}));

const socialBatteryState = computed(() => {
  const states = [
    { tone: 'very-low', label: 'Muy cansado' },
    { tone: 'low', label: 'Cansado' },
    { tone: 'regular', label: 'Regular' },
    { tone: 'good', label: 'Bien' },
    { tone: 'very-good', label: 'Muy bien' }
  ];
  const index = Math.min(states.length - 1, Math.floor(
    Math.max(0, Math.min(100, props.socialBattery)) / (100 / states.length)
  ));
  return { ...states[index], percentage: Math.round(props.socialBattery) };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index' as const, intersect: false }
  },
  scales: {
    x: { ticks: { color: '#8b95b4', maxTicksLimit: 8 }, grid: { color: '#1c2743' } },
    y: { ticks: { color: '#8b95b4' }, grid: { color: '#1c2743' }, beginAtZero: true }
  }
};
</script>

<template>
  <section class="history-dashboard">
    <div class="charts-grid">
      <div class="chart-card">
        <div class="title">Pulso</div>
        <div class="chart-wrap">
          <Line :data="pulseChartData" :options="chartOptions" />
        </div>
      </div>
      <div class="chart-card">
        <div class="title">Nivel de ruido</div>
        <div class="chart-wrap">
          <Line :data="noiseChartData" :options="chartOptions" />
        </div>
      </div>
    </div>
    <div class="context-strip">
      <div class="context-item social-summary">
        <span class="context-label">Batería social</span>
        <svg
          class="social-face"
          :class="socialBatteryState.tone"
          viewBox="0 0 40 40"
          role="img"
          :aria-label="socialBatteryState.label"
        >
          <circle cx="20" cy="20" r="17" />
          <circle class="eye" cx="14" cy="16" r="1.5" />
          <circle class="eye" cx="26" cy="16" r="1.5" />
          <path v-if="socialBatteryState.tone === 'very-low'" class="mouth" d="M14 27 Q20 22 26 27" />
          <path v-else-if="socialBatteryState.tone === 'low'" class="mouth" d="M14 26 Q20 23 26 26" />
          <path v-else-if="socialBatteryState.tone === 'regular'" class="mouth" d="M14 26 H26" />
          <path v-else class="mouth" d="M14 24 Q20 29 26 24" />
        </svg>
        <strong>{{ socialBatteryState.label }}</strong>
      </div>
      <div class="context-item">
        <span class="context-label">Actividad actual</span>
        <strong>{{ currentActivity || 'Sin actividad' }}</strong>
      </div>
    </div>
    <div class="date-row">
      <span class="date-label">Fecha</span>
      <strong>{{ displayDate }}</strong>
      <span class="time-label">Hora:</span>
      <strong>{{ displayTime }}</strong>
    </div>
  </section>
</template>

<style scoped>
.history-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  grid-template-rows: minmax(0, 1fr) auto;
  column-gap: 18px;
  height: 100%;
  min-height: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.chart-card {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: stretch;
  min-height: 0;
  border-bottom: 1px solid var(--line);
}
.title {
  display: flex;
  align-items: center;
  margin: 0;
  padding-left: 4px;
  font-size: 15px;
}
.chart-wrap {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
}
.chart-wrap :deep(canvas) { display: block; }
.charts-grid {
  display: grid;
  grid-column: 1;
  grid-row: 1;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  min-height: 0;
}
.context-strip {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  min-width: 0;
}
.context-item {
  display: flex; flex-direction: column; justify-content: center; gap: 3px;
  min-height: 76px; padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(14, 20, 40, .35);
}
.context-label { color: var(--muted); font-size: 11px; }
.context-item strong { font-size: 15px; }
.social-summary { align-items: center; }
.social-face { margin: 4px 0; }
.date-row {
  display: grid;
  grid-column: 1;
  grid-row: 2;
  grid-template-columns: 110px auto 1fr auto;
  align-items: center;
  gap: 10px;
  min-height: 54px;
  padding: 4px;
}
.date-label, .time-label {
  color: var(--muted);
  font-size: 14px;
}
.date-row strong { font-size: 15px; font-weight: 500; }
.time-label { justify-self: end; }
.social-status {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--muted);
}
.social-face {
  width: 30px;
  height: 30px;
  overflow: visible;
}
.social-face circle:first-child { stroke: rgba(27, 35, 58, .24); stroke-width: 1; }
.social-face .eye, .social-face .mouth { fill: none; stroke: #33404a; stroke-linecap: round; stroke-width: 1.7; }
.social-face .eye { fill: #33404a; stroke: none; }
.social-face.very-low circle:first-child, .social-face.low circle:first-child { fill: #adb6b7; }
.social-face.regular circle:first-child { fill: #fff; stroke: #9ba9ac; stroke-width: 1.5; }
.social-face.good circle:first-child { fill: #b9e6c5; }
.social-face.very-good circle:first-child { fill: #70c789; }
.social-status strong { color: var(--text); font-size: 11px; }
.social-status span:last-child { font-size: 11px; }
@media (max-width: 780px) {
  .history-dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto auto;
    row-gap: 4px;
  }
  .charts-grid { grid-column: 1; grid-row: 1; }
  .context-strip {
    grid-column: 1;
    grid-row: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .context-item { min-height: 58px; }
  .chart-card { grid-template-columns: 84px minmax(0, 1fr); }
  .date-row { grid-template-columns: auto 1fr; }
  .date-row { grid-column: 1; grid-row: 3; }
  .time-label { justify-self: start; }
}
</style>