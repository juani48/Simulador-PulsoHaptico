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
}>();

const labels = computed(() => props.history.map(p =>
  new Date(p.t).toLocaleTimeString('es-AR', { hour12: false })));

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
    legend: { labels: { color: '#cfd8f3' } },
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
        <strong>Perfil seleccionado</strong>
        <small>La configuración se carga desde el perfil elegido</small>
      </div>
      <div class="context-item context-action">
        <span class="context-label">Estado del simulador</span>
        <strong>Datos en vivo</strong>
        <span class="context-value">{{ socialBatteryState.percentage }}% de batería social</span>
      </div>
    </div>
    <div class="charts-grid">
      <div class="card chart-card">
        <div class="title">Pulso</div>
        <div class="chart-wrap">
          <Line :data="pulseChartData" :options="chartOptions" />
        </div>
      </div>
      <div class="card chart-card">
        <div class="title">Nivel de ruido</div>
        <div class="chart-wrap">
          <Line :data="noiseChartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.history-dashboard {
  display: grid;
  gap: 16px;
}
.chart-card { height: 250px; display: flex; flex-direction: column; }
.title { margin-bottom: 12px; }
.chart-wrap { min-height: 0; flex: 1; }
.charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.context-strip { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 16px; }
.context-item {
  display: flex; flex-direction: column; justify-content: center; gap: 3px;
  min-height: 84px; padding: 12px 16px; border-bottom: 1.5px solid var(--line);
}
.context-label { color: var(--muted); font-size: 12px; }
.context-item strong { font-size: 17px; }
.context-item small, .context-value { color: var(--muted); font-size: 11px; }
.social-summary { align-items: center; border-right: 1.5px solid var(--line); }
.social-face { margin: 4px 0; }
.context-action { border-left: 1.5px solid var(--line); }
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
  width: 36px;
  height: 36px;
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
  .context-strip, .charts-grid { grid-template-columns: 1fr; }
  .context-item { min-height: 64px; border: 0; border-bottom: 1px solid var(--line); }
  .social-summary, .context-action { border-left: 0; border-right: 0; }
  .chart-card { height: 220px; }
}
</style>