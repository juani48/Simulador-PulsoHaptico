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
    <div class="context-strip">
      <div class="context-item social-summary">
        <span class="context-label">Batería social</span>
        <span class="social-face" aria-hidden="true">{{ socialBatteryState.face }}</span>
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
.social-summary .social-face { font-size: 29px; }
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
.social-face { font-size: 35px; line-height: 1; }
.social-status strong { color: var(--text); font-size: 11px; }
.social-status span:last-child { font-size: 11px; }
@media (max-width: 780px) {
  .context-strip, .charts-grid { grid-template-columns: 1fr; }
  .context-item { min-height: 64px; border: 0; border-bottom: 1px solid var(--line); }
  .social-summary, .context-action { border-left: 0; border-right: 0; }
  .chart-card { height: 220px; }
}
</style>