<script setup lang="ts">
import { computed } from 'vue';
import type { Scenario, ScenarioStatus } from '../types';

const props = defineProps<{
  scenarios: Scenario[];
  status: ScenarioStatus;
  loading: boolean;
}>();

const emit = defineEmits<{ start: [id: string] }>();
const activeScenario = computed(() =>
  props.scenarios.find(scenario => scenario.id === props.status.scenarioId)
);
const activeSequenceImage = computed(() => {
  const sequence = activeScenario.value?.sequenceImages ?? [];
  if (!props.status.running || !sequence.length || !props.status.totalSeconds) return '';
  const position = props.status.elapsedSeconds / props.status.totalSeconds;
  return sequence[Math.min(Math.floor(position * sequence.length), sequence.length - 1)];
});
</script>

<template>
  <section class="card scenario-card">
    <div class="title">Scenarios · Simulación guiada</div>
    <div v-if="!scenarios.length" class="empty">No hay escenarios disponibles.</div>
    <div v-else class="scenario-list">
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
    <div v-if="status.running" class="progress">
      <img v-if="activeSequenceImage" class="active-sequence-image" :src="activeSequenceImage" alt="Paso actual del escenario" />
      <div class="progress-label">
        <span>Progreso</span>
        <span>{{ status.elapsedSeconds }} / {{ status.totalSeconds }} s</span>
      </div>
      <div class="progress-track">
        <div class="progress-value" :style="{ width: `${(status.elapsedSeconds / status.totalSeconds) * 100}%` }" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.scenario-card { grid-column: 1 / -1; }
.scenario-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.scenario { display: flex; gap: 14px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; }
.scenario-preview { display: grid; place-items: center; flex: 0 0 105px; min-height: 90px; border-radius: 8px; background: #0e1428; color: var(--muted); font-size: 11px; text-align: center; }
.scenario-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.scenario-content { flex: 1; }
.scenario-heading, .progress-label { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
h2 { margin: 0; font-size: 17px; }
.scenario-heading span, .sequence { color: var(--muted); font-size: 12px; }
p { margin: 7px 0 12px; color: var(--muted); font-size: 13px; }
.scenario-button { border: 0; border-radius: 7px; padding: 8px 12px; color: #07101d; background: var(--accent-2); font-weight: 700; cursor: pointer; }
.scenario-button:disabled { opacity: .5; cursor: not-allowed; }
.progress { margin-top: 16px; color: var(--muted); font-size: 12px; }
.progress-track { height: 6px; margin-top: 7px; overflow: hidden; border-radius: 4px; background: #0e1428; }
.progress-value { height: 100%; border-radius: inherit; background: var(--accent-2); transition: width .3s; }
.active-sequence-image { width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 8px; object-fit: cover; }
.empty { color: var(--muted); }
@media (max-width: 780px) { .scenario-list { grid-template-columns: 1fr; } }
</style>
