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
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>CONTEXT SIMULATOR</h1>
      <span class="dot" :class="{ live: !!state }" />
    </header>

    <main class="grid">
      <ScenarioPanel :scenarios="scenarios" :status="scenarioStatus" :loading="scenarioLoading" @start="startScenario" />
      <CellphonePanel :data="state?.cellphone ?? null" @update="updateState" />
      <SensorPanel :data="state?.sensor ?? null" @update="updateState" />
      <HistoryChart :history="history" />
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
  grid-template-columns: 1fr 1fr;
}
.grid > :last-child { grid-column: 1 / -1; }

@media (max-width: 780px) {
  .grid { grid-template-columns: 1fr; }
}
</style>