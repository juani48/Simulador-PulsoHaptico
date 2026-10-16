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
      label: 'Pulso (BPM)',
      data: props.history.map(p => p.pulse),
      borderColor: '#ff8a3d',
      backgroundColor: 'rgba(255,138,61,.15)',
      tension: .35, fill: true, pointRadius: 0
    }
  ]
}));

const noiseChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Sonido (dB)',
      data: props.history.map(p => p.noiseLevel),
      borderColor: '#4ea3ff',
      backgroundColor: 'rgba(78,163,255,.12)',
      tension: .35, fill: true, pointRadius: 0
    }
  ]
}));

const socialBatteryState = computed(() => {
  const states = [
    { face: '😫', label: 'Muy cansado' },
    { face: '😩', label: 'Cansado' },
    { face: '😞', label: 'Bajo' },
    { face: '😐', label: 'Regular' },
    { face: '🙂', label: 'Bien' },
    { face: '😊', label: 'Muy bien' },
    { face: '😄', label: 'Excelente' }
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
    <div class="card chart-card">
      <div class="title">Historial · Pulso</div>
      <div class="chart-wrap">
        <Line :data="pulseChartData" :options="chartOptions" />
      </div>
    </div>
    <div class="card chart-card">
      <div class="title">Historial · Sonido</div>
      <div class="chart-wrap">
        <Line :data="noiseChartData" :options="chartOptions" />
      </div>
    </div>
    <div class="card social-card">
      <div class="title">Batería social actual</div>
      <div class="social-status" :aria-label="`${socialBatteryState.label}, ${socialBatteryState.percentage}%`">
        <span class="social-face" aria-hidden="true">{{ socialBatteryState.face }}</span>
        <strong>{{ socialBatteryState.label }}</strong>
        <span>{{ socialBatteryState.percentage }}%</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.history-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(170px, .58fr);
  gap: 18px;
}
.chart-card { height: 360px; display: flex; flex-direction: column; }
.social-card { height: 240px; display: flex; flex-direction: column; align-self: center; }
.title { margin-bottom: 12px; }
.chart-wrap { min-height: 0; flex: 1; }
.social-status {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--muted);
}
.social-face { font-size: 76px; line-height: 1; }
.social-status strong { color: var(--text); font-size: 18px; }
@media (max-width: 780px) {
  .history-dashboard { grid-template-columns: 1fr; }
  .chart-card { height: 280px; }
  .social-card { height: 210px; width: min(100%, 280px); justify-self: center; }
}
</style>