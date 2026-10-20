<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CellphonePanel from './components/CellphonePanel.vue';
import SensorPanel from './components/SensorPanel.vue';
import HistoryChart from './components/HistoryChart.vue';
import ScenarioPanel from './components/ScenarioPanel.vue';
import ProfilePanel from './components/ProfilePanel.vue';
import type { BridgeState, HistoryPoint, NeurodivergentProfile, Scenario, ScenarioStatus } from './types';

const state = ref<BridgeState | null>(null);
const history = ref<HistoryPoint[]>([]);
const scenarios = ref<Scenario[]>([]);
const profiles = ref<NeurodivergentProfile[]>([]);
const selectedProfileId = ref('');
const scenarioStatus = ref<ScenarioStatus>({ scenarioId: null, elapsedSeconds: 0, totalSeconds: 0, running: false, paused: false });
const scenarioLoading = ref(false);
const scenarioActionInFlight = ref(false);
const carousel = ref<HTMLElement | null>(null);
const carouselIndex = ref(0);
let refreshTimer: ReturnType<typeof setInterval> | undefined;
async function fetchAll() {
  try {
    const [s, h, status, availableScenarios, availableProfiles] = await Promise.all([
      fetch('/api/data').then(r => r.json()),
      fetch('/api/history').then(r => r.json())
      , fetch('/api/scenario-status').then(r => r.json())
      ,       fetch('/api/scenarios').then(r => r.json()),
      fetch('/api/profiles').then(r => r.json())
    ]);
    state.value = s;
    history.value = h;
    if (!scenarioActionInFlight.value) scenarioStatus.value = status;
    scenarios.value = availableScenarios;
    profiles.value = availableProfiles;
    selectedProfileId.value = s.selectedProfileId;
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
  scenarioActionInFlight.value = true;
  try {
    const response = await fetch(`/api/scenarios/${id}/start`, { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    scenarioStatus.value = await response.json();
  } catch (e) {
    console.error('No se pudo iniciar el escenario', e);
  } finally {
    scenarioLoading.value = false;
    scenarioActionInFlight.value = false;
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

async function selectProfile(profileId: string) {
    try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        state.value = await response.json();
        selectedProfileId.value = profileId;
        history.value = await fetch('/api/history').then(r => r.json());
        scenarios.value = await fetch('/api/scenarios').then(r => r.json());
        scenarioStatus.value = await fetch('/api/scenario-status').then(r => r.json());
      } catch (e) {
        console.error('No se pudo cargar el perfil', e);
    }
}

async function toggleScenarioPause() {
        scenarioActionInFlight.value = true;
        try {
        const response = await fetch('/api/scenario-status/pause', { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        scenarioStatus.value = await response.json();
      } catch (e) {
        console.error('No se pudo pausar el escenario', e);
      } finally {
        scenarioActionInFlight.value = false;
      }
}

async function stopScenario() {
      scenarioActionInFlight.value = true;
      try {
        const response = await fetch('/api/scenario-status/stop', { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        scenarioStatus.value = await response.json();
      } catch (e) {
        console.error('No se pudo salir del escenario', e);
      } finally {
        scenarioActionInFlight.value = false;
      }
}

function goToCarousel(index: number) {
  const nextIndex = Math.max(0, Math.min(index, 2));
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
      <h1>Simulador de Valores de Contexto</h1>
      <span class="connection" :class="{ live: !!state }">{{ state ? 'Conectado' : 'Conectando…' }}</span>
    </header>

    <main class="grid">
      <HistoryChart
        :history="history"
        :social-battery="state?.socialBattery ?? 0"
        :date-time="state?.cellphone.dateTime"
        :current-activity="scenarioStatus.currentStage?.activity || state?.profile.activities[0]?.name"
      />
      <div class="carousel-shell">
        <div ref="carousel" class="carousel" aria-label="Controles de simulación">
        <div class="carousel-item">
          <ScenarioPanel
            :scenarios="scenarios"
            :status="scenarioStatus"
            :loading="scenarioLoading"
            @start="startScenario"
            @pause="toggleScenarioPause"
            @stop="stopScenario"
          />
        </div>
        <div class="carousel-item data-item">
          <CellphonePanel :data="state?.cellphone ?? null" @update="updateState" />
          <SensorPanel :data="state?.sensor ?? null" @update="updateState" />
        </div>
        <div class="carousel-item">
          <ProfilePanel
            :profiles="profiles"
            :selected-profile-id="selectedProfileId"
            @select="selectProfile"
          />
        </div>
        </div>
        <div class="carousel-controls">
          <button
            class="carousel-button"
            type="button"
            :aria-label="`Ver ${carouselIndex === 1 ? 'escenarios' : 'datos simulados'}`"
            :class="{ active: carouselIndex === 0 }"
            :disabled="carouselIndex === 0"
            @click="goToCarousel(carouselIndex - 1)"
          >
            <span aria-hidden="true">←</span>
            <span>{{ carouselIndex === 1 ? 'Escenarios' : 'Datos simulados' }}</span>
          </button>
          <div class="carousel-dots" aria-hidden="true">
            <span v-for="index in 3" :key="index" class="carousel-dot" :class="{ active: carouselIndex === index - 1 }" />
          </div>
          <button
            class="carousel-button"
            type="button"
            :aria-label="`Ver ${carouselIndex === 0 ? 'datos simulados' : 'perfiles'}`"
            :class="{ active: carouselIndex === 2 }"
            :disabled="carouselIndex === 2"
            @click="goToCarousel(carouselIndex + 1)"
          >
            <span>{{ carouselIndex === 0 ? 'Datos simulados' : 'Perfiles' }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: min(1120px, 100%);
  height: 100%;
  margin: 0 auto;
  padding: 24px 28px;
  overflow: hidden;
}
.header {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-bottom: 22px; padding-bottom: 16px;
  border-bottom: 1.5px solid var(--line);
}
.header h1 {
  font-size: 15px; font-weight: 600;
  letter-spacing: .08em; margin: 0;
  background: linear-gradient(180deg, #fff, #a9b6da);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.connection {
  border: 1px solid var(--line); border-radius: 999px;
  padding: 4px 9px; color: var(--muted); font-size: 11px;
}
.connection.live { color: var(--accent-2); }

.grid {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(300px, 40vh) minmax(0, 1fr);
  gap: 12px;
  grid-template-columns: 1fr;
}
.grid > :first-child {
  min-height: 0;
  overflow: hidden;
}
.carousel-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
  border-top: 1px solid var(--line);
  padding-top: 10px;
}
.carousel {
  display: flex;
  flex: 1;
  gap: 18px;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
  scroll-behavior: smooth;
}
.carousel-item {
  flex: 0 0 100%;
  min-height: 0;
  min-width: 0;
  scroll-snap-align: start;
}
.carousel :deep(.title) {
  font-size: 15px;
  text-align: center;
}
.carousel-controls {
  flex: 0 0 auto;
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
  border-radius: 5px;
  padding: 8px 13px;
  color: var(--text);
  background: var(--card);
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
  .app { padding: 16px 14px; }
  .grid { grid-template-rows: minmax(280px, 42vh) minmax(0, 1fr); }
  .data-item { grid-template-columns: 1fr; }
  .carousel-button { padding: 8px 10px; }
}
</style>