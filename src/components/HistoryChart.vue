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

const props = defineProps<{ history: HistoryPoint[] }>();

const chartData = computed(() => ({
  labels: props.history.map(p =>
    new Date(p.t).toLocaleTimeString('es-AR', { hour12: false })),
  datasets: [
    {
      label: 'Pulso (BPM)',
      data: props.history.map(p => p.pulse),
      borderColor: '#ff8a3d',
      backgroundColor: 'rgba(255,138,61,.15)',
      tension: .35, fill: true, pointRadius: 0
    },
    {
      label: 'Ruido (dB)',
      data: props.history.map(p => p.noiseLevel),
      borderColor: '#4ea3ff',
      backgroundColor: 'rgba(78,163,255,.12)',
      tension: .35, fill: true, pointRadius: 0
    },
    {
      label: 'Personas cercanas',
      data: props.history.map(p => p.nearbyPeople),
      borderColor: '#52e2a6',
      backgroundColor: 'rgba(82,226,166,.10)',
      tension: .35, fill: true, pointRadius: 0
    }
  ]
}));

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
  <section class="card">
    <div class="title">History · Parámetros en el tiempo</div>
    <div class="chart-wrap">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<style scoped>
.title { margin-bottom: 12px; }
.chart-wrap { height: 320px; }
</style>