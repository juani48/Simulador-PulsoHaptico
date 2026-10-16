<script setup lang="ts">
import { computed } from 'vue';
import type { Activity } from '../types';

const props = defineProps<{
  activities: Activity[];
  selectedActivity: string;
}>();

const emit = defineEmits<{
  select: [activityId: string];
  updateSettings: [
    activityId: string,
    canBeDisturbing: boolean
  ];
}>();

const selectedActivityData = computed(() =>
  props.activities.find(activity => activity.id === props.selectedActivity)
);

function updateSettings(canBeDisturbing: boolean) {
  if (!selectedActivityData.value) return;
  emit('updateSettings', selectedActivityData.value.id, canBeDisturbing);
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
      </template>
      <p v-else class="description">Seleccioná una actividad para configurar si puede molestar.</p>
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
@media (max-width: 720px) {
  .activity-layout { grid-template-columns: 1fr; height: auto; }
  .activities { max-height: 260px; }
}
</style>
