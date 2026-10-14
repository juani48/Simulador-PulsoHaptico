<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CellphonePanel from './components/CellphonePanel.vue';
import SensorPanel from './components/SensorPanel.vue';
import HistoryChart from './components/HistoryChart.vue';
import ScenarioPanel from './components/ScenarioPanel.vue';
import type { BridgeState, HistoryPoint, Scenario, ScenarioStatus } from './types';

const state = ref<BridgeState | null>(null);
const history = ref<HistoryPoint[]>([]);
const scenarios = ref<Scenario[]>([]);
const scenarioStatus = ref<ScenarioStatus>({ scenarioId: null, elapsedSeconds: 0, totalSeconds: 0, running: false });
const scenarioLoading = ref(false);
const carousel = ref<HTMLElement | null>(null);
const carouselIndex = ref(0);
let refreshTimer: ReturnType<typeof setInterval> | undefined;
async function fetchAll() {
  try {
    const [s, h, status, availableScenarios] = await Promise.all([
      fetch('/api/get-data').then(r => r.json()),
      fetch('/api/history').then(r => r.json())
      , fetch('/api/scenario-status').then(r => r.json())
      , fetch('/api/scenarios').then(r => r.json())
    ]);
    state.value = s;
    history.value = h;
    scenarioStatus.value = status;
    scenarios.value = availableScenarios;
  } catch (e) {
    console.error('Bridge no disponible', e);
  }
}

onMounted(() => {
  fetchAll();
  refreshTimer = setInterval(fetchAll, 1000);
});
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });

async function startScenario(id: string) {
  scenarioLoading.value = true;
  try {
    const response = await fetch(`/api/scenarios/${id}/start`, { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    scenarioStatus.value = await response.json();
  } catch (e) {
    console.error('No se pudo iniciar el escenario', e);
  } finally {
    scenarioLoading.value = false;
  }
}
async function updateState(patch: Partial<BridgeState>) {
  if (!state.value) return;
  const nextState = {
    ...state.value,
    ...patch,
    cellphone: { ...state.value.cellphone, ...patch.cellphone },
    sensor: { ...state.value.sensor, ...patch.sensor }
  };
  try {
    const response = await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextState)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.value = await response.json();
    const historyResponse = await fetch('/api/history');
    if (!historyResponse.ok) throw new Error(`HTTP ${historyResponse.status}`);
    history.value = await historyResponse.json();
  } catch (e) {
    console.error('No se pudo actualizar el simulador', e);
  }
}

function goToCarousel(index: number) {
  const nextIndex = Math.max(0, Math.min(index, 1));
  const element = carousel.value;
  if (!element) return;

  carouselIndex.value = nextIndex;
  element.scrollTo({
    left: nextIndex * (element.clientWidth + 18),
    behavior: 'smooth'
  });
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>SIMULADOR DE CONTEXTO</h1>
      <span class="dot" :class="{ live: !!state }" />
    </header>

    <main class="grid">
      <HistoryChart :history="history" />
      <div class="carousel-shell">
        <div ref="carousel" class="carousel" aria-label="Controles de simulación">
        <div class="carousel-item">
          <ScenarioPanel :scenarios="scenarios" :status="scenarioStatus" :loading="scenarioLoading" @start="startScenario" />
        </div>
        <div class="carousel-item data-item">
          <CellphonePanel :data="state?.cellphone ?? null" @update="updateState" />
          <SensorPanel :data="state?.sensor ?? null" @update="updateState" />
        </div>
        </div>
        <div class="carousel-controls">
          <button
            class="carousel-button"
            type="button"
            aria-label="Ver escenarios"
            :class="{ active: carouselIndex === 0 }"
            :disabled="carouselIndex === 0"
            @click="goToCarousel(0)"
          >
            <span aria-hidden="true">←</span>
            <span>Escenarios</span>
          </button>
          <div class="carousel-dots" aria-hidden="true">
            <span v-for="index in 2" :key="index" class="carousel-dot" :class="{ active: carouselIndex === index - 1 }" />
          </div>
          <button
            class="carousel-button"
            type="button"
            aria-label="Ver datos simulados"
            :class="{ active: carouselIndex === 1 }"
            :disabled="carouselIndex === 1"
            @click="goToCarousel(1)"
          >
            <span>Datos simulados</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
.header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 24px;
}
.header h1 {
  font-size: 26px; letter-spacing: 2px; margin: 0;
  background: linear-gradient(180deg, #fff, #a9b6da);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #445; transition: background .3s;
}
.dot.live { background: var(--accent-2); box-shadow: 0 0 10px var(--accent-2); }

.grid {
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr;
}
.carousel-shell {
  width: 100%;
  min-width: 0;
  height: 398px;
}
.carousel {
  display: flex;
  gap: 18px;
  height: calc(100% - 42px);
  min-width: 0;
  overflow: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
  scroll-behavior: smooth;
}
.carousel-item {
  flex: 0 0 100%;
  height: 100%;
  min-width: 0;
  scroll-snap-align: start;
}
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px auto 0;
  max-width: 440px;
}
.carousel-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 13px;
  color: var(--muted);
  background: rgba(19, 26, 46, .8);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color .2s, color .2s, background .2s, transform .2s;
}
.carousel-button:not(:disabled):hover {
  color: var(--text);
  border-color: var(--accent);
  background: rgba(78, 163, 255, .12);
  transform: translateY(-1px);
}
.carousel-button:disabled {
  color: var(--text);
  border-color: var(--accent-2);
  background: rgba(82, 226, 166, .1);
  cursor: default;
}
.carousel-dots { display: flex; gap: 6px; }
.carousel-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--line);
  transition: background .2s, transform .2s;
}
.carousel-dot.active {
  background: var(--accent-2);
  transform: scale(1.25);
}
.data-item {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 780px) {
  .data-item { grid-template-columns: 1fr; }
  .carousel-button { padding: 8px 10px; }
}
</style>