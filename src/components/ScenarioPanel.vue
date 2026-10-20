<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Scenario, ScenarioStatus, ScenarioValue } from '../types';

const props = defineProps<{
  scenarios: Scenario[];
  status: ScenarioStatus;
  loading: boolean;
}>();

const emit = defineEmits<{ start: [id: string]; pause: []; stop: [] }>();
const video = ref<HTMLVideoElement | null>(null);
const activeScenario = computed(() =>
  props.scenarios.find(scenario => scenario.id === props.status.scenarioId)
);
const activeStage = computed(() => props.status.currentStage);
const activeSequenceImage = computed(() => {
  if (activeStage.value?.image) return activeStage.value.image;
  const sequence = activeScenario.value?.sequenceImages ?? [];
  if (!props.status.running || !sequence.length || !props.status.totalSeconds) return '';
  const position = props.status.elapsedSeconds / props.status.totalSeconds;
  return sequence[Math.min(Math.floor(position * sequence.length), sequence.length - 1)];
});
watch(() => props.status.paused, paused => {
  if (!video.value) return;
  if (paused) video.value.pause();
  else void video.value.play();
});
const valueLabels: Record<ScenarioValue, string> = {
  noiseLevel: 'Ruido',
  pulse: 'Pulso'
};
const valueUnits: Record<ScenarioValue, string> = {
  noiseLevel: 'dB',
  pulse: 'BPM'
};
function scenarioValues(scenario: Scenario) {
  const values = new Map<ScenarioValue, { minimum: number; maximum: number }>();
  for (const stage of scenario.stages) {
    for (const [key, range] of Object.entries(stage.values) as [ScenarioValue, { minimum: number; maximum: number }][]) {
      const current = values.get(key);
      values.set(key, current
        ? { minimum: Math.min(current.minimum, range.minimum), maximum: Math.max(current.maximum, range.maximum) }
        : range);
    }
  }
  return [...values.entries()];
}
</script>

<template>
  <section class="card scenario-card">
    <div class="title">Escenarios basados en personas neurodivergentes</div>
    <div v-if="!status.running && !scenarios.length" class="empty">No hay escenarios disponibles.</div>
    <div v-else-if="!status.running" class="scenario-list">
      <article v-for="scenario in scenarios" :key="scenario.id" class="scenario">
        <div class="scenario-preview">
          <img v-if="scenario.previewImage" :src="scenario.previewImage" :alt="`Vista previa de ${scenario.name}`" />
          <span v-else>Sin vista previa</span>
        </div>
        <div class="scenario-content">
          <div class="scenario-heading">
            <h2>{{ scenario.name }}</h2>
            <span>{{ scenario.durationSeconds }} s</span>
          </div>
          <p>{{ scenario.description }}</p>
          <div class="values-title">Valores a simular</div>
          <div class="values">
            <span v-for="[key, range] in scenarioValues(scenario)" :key="key" class="value-chip">
              {{ valueLabels[key] }}: {{ range.minimum }}–{{ range.maximum }} {{ valueUnits[key] }}
            </span>
          </div>
          <div v-if="scenario.sequenceImages.length" class="sequence">
            {{ scenario.sequenceImages.length }} imágenes en secuencia
          </div>
          <button
            class="scenario-button"
            :disabled="loading || status.running"
            @click="emit('start', scenario.id)"
          >
            {{ status.scenarioId === scenario.id && status.running ? 'En ejecución…' : 'Ejecutar escenario' }}
          </button>
        </div>
      </article>
    </div>
    <div v-if="status.running" class="progress active-scenario">
      <div class="active-media">
        <video
          v-if="activeScenario?.videoUrl"
          ref="video"
          class="scenario-video"
          :src="activeScenario.videoUrl"
          autoplay
          muted
          loop
          playsinline
        />
        <img v-else-if="activeSequenceImage" class="active-sequence-image" :src="activeSequenceImage" alt="Paso actual del escenario" />
        <div v-else class="scenario-video-placeholder">
          <strong>{{ activeStage?.name ?? 'Escenario' }}</strong>
          <span>Video pendiente de cargar</span>
        </div>
      </div>
      <div class="active-details">
        <div v-if="activeStage" class="stage-info">
          <strong>{{ activeStage.activity }}</strong>
          <span>{{ activeStage.description }}</span>
        </div>
        <div class="progress-label">
          <span>Progreso</span>
          <span>{{ status.elapsedSeconds }} / {{ status.totalSeconds }} s</span>
        </div>
        <div class="progress-track">
          <div class="progress-value" :style="{ width: `${(status.elapsedSeconds / status.totalSeconds) * 100}%` }" />
        </div>
        <div class="scenario-actions">
          <button type="button" class="scenario-button" :disabled="!status.running" @click="emit('pause')">
            {{ status.paused ? 'Continuar' : 'Pausar' }}
          </button>
          <button type="button" class="scenario-exit" @click="emit('stop')">Salir</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scenario-card { min-height: 0; }
.scenario-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: 10px 16px; padding: 5px 2px; }
.scenario { display: grid; grid-template-columns: minmax(0, 1fr) 124px; min-width: 0; gap: 10px; padding: 9px; border: 1px solid var(--line); border-radius: 10px; }
.scenario-preview { display: grid; grid-column: 2; grid-row: 1; place-items: center; width: 124px; height: 94px; border-radius: 8px; background: #0e1428; color: var(--muted); font-size: 11px; text-align: center; overflow: hidden; }
.scenario-preview img { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; }
.scenario-content { grid-column: 1; grid-row: 1; min-width: 0; }
.scenario-heading, .progress-label { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
h2 { margin: 0; font-size: 17px; }
.scenario-heading span, .sequence, .values-title { color: var(--muted); font-size: 12px; }
p { margin: 5px 0 8px; color: var(--muted); font-size: 12px; }
.values-title { margin-bottom: 5px; }
.values { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 7px; }
.value-chip { padding: 4px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); font-size: 11px; }
.scenario-button { border: 0; border-radius: 7px; padding: 6px 10px; color: #07101d; background: var(--accent-2); font-weight: 700; cursor: pointer; }
.scenario-button:disabled { opacity: .5; cursor: not-allowed; }
.progress { margin-top: 16px; color: var(--muted); font-size: 12px; }
.active-scenario {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, .9fr);
  gap: 18px;
  align-items: center;
}
.active-media { grid-column: 2; grid-row: 1; min-width: 0; }
.active-details { grid-column: 1; grid-row: 1; min-width: 0; }
.progress-track { height: 6px; margin-top: 7px; overflow: hidden; border-radius: 4px; background: #0e1428; }
.progress-value { height: 100%; border-radius: inherit; background: var(--accent-2); transition: width .3s; }
.active-sequence-image { display: block; width: 100%; max-height: min(34vw, 360px); aspect-ratio: 16 / 9; border-radius: 8px; background: #0e1428; object-fit: contain; }
.scenario-video, .scenario-video-placeholder { display: block; width: 100%; max-height: min(34vw, 360px); aspect-ratio: 16 / 9; border-radius: 8px; }
.scenario-video { background: #0e1428; object-fit: contain; }
.scenario-video-placeholder { display: grid; place-items: center; align-content: center; gap: 5px; background: #0e1428; color: var(--muted); }
.scenario-video-placeholder strong { color: var(--text); font-size: 18px; }
.stage-info { display: grid; gap: 4px; margin-bottom: 10px; color: var(--muted); font-size: 13px; }
.stage-info strong { color: var(--accent); }
.scenario-alert { display: grid; gap: 5px; margin-bottom: 10px; padding: 11px; border: 1px solid var(--warn); border-radius: 8px; background: rgba(255, 138, 61, .12); color: var(--text); }
.scenario-alert span, .scenario-alert li { color: var(--muted); font-size: 12px; }
.scenario-alert ul { margin: 2px 0 0; padding-left: 18px; }
.scenario-actions { display: flex; gap: 8px; margin-top: 10px; }
.scenario-exit { border: 1px solid var(--line); border-radius: 7px; padding: 8px 12px; color: var(--text); background: transparent; cursor: pointer; }
.empty { color: var(--muted); }
@media (max-width: 700px) {
  .scenario-list { grid-template-columns: 1fr; }
  .scenario { grid-template-columns: minmax(0, 1fr) 104px; }
  .scenario-preview { width: 104px; height: 82px; }
  .active-scenario { grid-template-columns: 1fr; }
  .active-media { grid-column: 1; grid-row: 1; }
  .active-details { grid-column: 1; grid-row: 2; }
  .carousel-item, .carousel { min-height: 0; }
  .scenario-card { min-height: 0; }
}
</style>
