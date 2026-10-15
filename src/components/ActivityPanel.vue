<script setup lang="ts">
import { computed } from 'vue';
import type { Activity, DysregulatingFactor } from '../types';

const props = defineProps<{
  activities: Activity[];
  selectedActivity: string;
}>();

const emit = defineEmits<{
  select: [activityId: string];
  updateSettings: [
    activityId: string,
    canBeDisturbing: boolean,
    dysregulatingFactors: DysregulatingFactor[]
  ];
}>();

const selectedActivityData = computed(() =>
  props.activities.find(activity => activity.id === props.selectedActivity)
);

const dysregulatingFactors: DysregulatingFactor[] = [
  'Ruido emergente del ambiente',
  'Murmullo de personas',
  'Luces',
  'Olores',
  'Hablar en público',
  'Situaciones no planificadas',
  'Colores',
  'Sociabilizar',
  'Discusiones que no llegan a ningún lado',
  'Texturas',
  'Aglomeración de personas',
  'Usar calzado (tener el pie encerrado)',
  'Absorber las emociones de otros',
  'Poca tolerancia a la frustración',
  'Sobrecarga de actividades (requieren procesamiento información)',
  'Deadlines simultáneos',
  'Situaciones de evaluación'
];

function updateSettings(canBeDisturbing: boolean, factor?: DysregulatingFactor) {
  if (!selectedActivityData.value) return;
  const factors = factor
    ? selectedActivityData.value.dysregulatingFactors.includes(factor)
      ? selectedActivityData.value.dysregulatingFactors.filter(item => item !== factor)
      : [...selectedActivityData.value.dysregulatingFactors, factor]
    : selectedActivityData.value.dysregulatingFactors;
  if (factors.length === 0) return;
  emit('updateSettings', selectedActivityData.value.id, canBeDisturbing, factors);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
</script>

<template>
  <section class="activity-layout">
    <div class="card">
      <div class="title">Seleccionar actividad</div>
      <p class="description">Marca una actividad principal para enviarla al dispositivo.</p>

      <div class="activities">
        <label v-for="activity in activities" :key="activity.id" class="activity"
          :class="{ selected: selectedActivity === activity.id }">
          <input
            type="radio"
            name="selected-activity"
            :value="activity.id"
            :checked="selectedActivity === activity.id"
            @change="emit('select', activity.id)"
          />
          <span class="activity-content">
            <strong>{{ activity.name }}</strong>
            <span>{{ activity.description }}</span>
            <span>{{ formatDateTime(activity.dateTime) }}</span>
            <span>Duración: {{ activity.duration }} horas</span>
          </span>
        </label>
      </div>
    </div>

    <div class="card settings-card">
      <div class="title">Configuración de la actividad</div>
      <template v-if="selectedActivityData">
        <div class="disturbing-options">
          <strong style="margin-top: 10px;">¿Puede molestar?</strong>
          <label>
            <input type="radio" name="selected-activity-disturbing" :checked="selectedActivityData.canBeDisturbing"
              @change="updateSettings(true)" />
            Sí
          </label>
          <label>
            <input type="radio" name="selected-activity-disturbing" :checked="!selectedActivityData.canBeDisturbing"
              @change="updateSettings(false)" />
            No
          </label>
        </div>
        <div class="factor-section">
          <strong>Factores desreguladores</strong>
          <div class="factor-list">
            <label v-for="factor in dysregulatingFactors" :key="factor" class="factor">
              <input type="checkbox" :checked="selectedActivityData.dysregulatingFactors.includes(factor)"
                @change="updateSettings(selectedActivityData.canBeDisturbing, factor)" />
              <span>{{ factor }}</span>
            </label>
          </div>
        </div>
      </template>
      <p v-else class="description">Seleccioná una actividad para configurar sus factores.</p>
    </div>
  </section>
</template>

<style scoped>
.activity-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  height: 100%;
  min-height: 0;
}
.card {
  min-width: 0;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
}
.description { margin: 14px 0; color: var(--muted); font-size: 13px; }
.activities {
  display: grid;
  gap: 10px;
  max-height: calc(100% - 74px);
  overflow-y: auto;
  padding-right: 8px;
}
.activity {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color .2s, background .2s;
}
.activity:hover, .activity.selected {
  border-color: var(--accent-2);
  background: rgba(82, 226, 166, .08);
}
.activity input { margin-top: 3px; accent-color: var(--accent-2); }
.activity-content { display: grid; gap: 3px; font-size: 12px; color: var(--muted); }
.activity-content strong { color: var(--text); font-size: 14px; }
.disturbing-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
}
.disturbing-options strong { color: var(--text); }
.disturbing-options label { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.disturbing-options input { accent-color: var(--accent-2); }
.settings-card { display: flex; flex-direction: column; }
.factor-section {
  display: grid;
  gap: 10px;
  min-height: 0;
  margin-top: 14px;
  color: var(--text);
  font-size: 13px;
}
.factor-list {
  display: grid;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
}
.factor { display: flex; align-items: flex-start; gap: 7px; color: var(--muted); cursor: pointer; }
.factor input { flex: 0 0 auto; margin-top: 2px; accent-color: var(--accent-2); }
@media (max-width: 720px) {
  .activity-layout { grid-template-columns: 1fr; height: auto; }
  .activities { max-height: 260px; }
  .factor-list { max-height: 180px; }
}
</style>
