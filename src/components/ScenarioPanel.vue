<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Scenario, ScenarioStatus } from '../types';

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

function syncVideoPosition() {
  if (!video.value || !props.status.totalSeconds || !Number.isFinite(video.value.duration)) return;
  video.value.currentTime = Math.min(
    (props.status.elapsedSeconds / props.status.totalSeconds) * video.value.duration,
    video.value.duration
  );
}

watch(() => props.status.paused, paused => {
  if (!video.value) return;
  if (paused) {
    syncVideoPosition();
    video.value.pause();
  } else {
    syncVideoPosition();
    void video.value.play();
  }
});
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
        <div class="scenario-name">
          <h2>{{ scenario.name }}</h2>
          <span class="scenario-description">{{ scenario.description }}</span>
        </div>
        <button
          class="scenario-button"
          :disabled="loading || status.running"
          @click="emit('start', scenario.id)"
        >
          {{ status.scenarioId === scenario.id && status.running ? 'En ejecución…' : 'Iniciar' }}
        </button>
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
          @loadedmetadata="syncVideoPosition"
        />
        <img v-else-if="activeSequenceImage" class="active-sequence-image" :src="activeSequenceImage" alt="Paso actual del escenario" />
        <div v-else class="scenario-video-placeholder">
          <strong>{{ activeStage?.name ?? 'Escenario' }}</strong>
          <span>Video pendiente de cargar</span>
        </div>
      </div>
      <div class="active-details">
        <div v-if="activeScenario" class="scenario-heading">
          <strong>{{ activeScenario.name }}</strong>
        </div>
        <div v-if="activeStage" class="stage-info">
          <span>{{ activeStage.description }}</span>
        </div>
        <div class="progress-label">
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
.scenario-card { height: 100%; min-height: 0; overflow-y: auto; }
.scenario-list { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 10px; padding: 5px 2px; }
.scenario {
  display: grid;
  grid-template-columns: 124px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
}
.scenario-preview {
  display: grid;
  place-items: center;
  width: 124px;
  height: 82px;
  border-radius: 8px;
  overflow: hidden;
  background: #0e1428;
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}
.scenario-preview img { width: 100%; height: 100%; object-fit: contain; }
.scenario-name { display: grid; gap: 3px; min-width: 0; }
h2 { margin: 0; font-size: 15px; line-height: 1.4; }
.scenario-name span { color: var(--muted); }
.scenario-description { font-size: 15px; line-height: 1.35; }
.scenario-button {
  width: clamp(125px, 14vw, 170px);
  min-height: 34px;
  flex-shrink: 0;
  border: 0;
  border-radius: 7px;
  padding: 6px 10px;
  color: #07101d;
  background: var(--accent-2);
  font-weight: 700;
  cursor: pointer;
  white-space: normal;
}
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
.scenario-heading { display: grid; gap: 7px; margin-bottom: 14px; text-align: center; }
.scenario-heading strong { color: var(--text); font-size: 24px; line-height: 1.2; }
.scenario-heading span { color: var(--muted); font-size: 17px; line-height: 1.4; }
.stage-info { display: grid; gap: 7px; margin-bottom: 10px; color: var(--muted); font-size: 16px; text-align: center; }
.scenario-alert { display: grid; gap: 5px; margin-bottom: 10px; padding: 11px; border: 1px solid var(--warn); border-radius: 8px; background: rgba(255, 138, 61, .12); color: var(--text); }
.scenario-alert span, .scenario-alert li { color: var(--muted); font-size: 12px; }
.scenario-alert ul { margin: 2px 0 0; padding-left: 18px; }
.scenario-actions { display: flex; gap: 8px; margin-top: 10px; }
.scenario-exit { border: 1px solid var(--line); border-radius: 7px; padding: 8px 12px; color: var(--text); background: transparent; cursor: pointer; }
.empty { color: var(--muted); }
@media (max-width: 700px) {
  .scenario-list { grid-template-columns: 1fr; }
  .scenario { grid-template-columns: 104px minmax(0, 1fr); }
  .scenario-preview { width: 104px; height: 82px; }
  .scenario-button {
    grid-column: 1 / -1;
    justify-self: stretch;
    width: 100%;
  }
  .active-scenario { grid-template-columns: 1fr; }
  .active-media { grid-column: 1; grid-row: 1; }
  .active-details { grid-column: 1; grid-row: 2; }
  .carousel-item, .carousel { min-height: 0; }
  .scenario-card { min-height: 0; }
}
@media (max-width: 420px) {
  .scenario { grid-template-columns: 1fr; }
  .scenario-preview { width: 100%; height: 120px; }
}
</style>
