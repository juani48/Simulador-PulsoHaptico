<script setup lang="ts">
import type { SensorData } from '../types';
const props = defineProps<{ data: SensorData | null }>();
const emit = defineEmits<{ update: [patch: { sensor: SensorData }] }>();

function updatePulse(value: string) {
  if (!props.data) return;
  emit('update', { sensor: { pulse: Number(value) } });
}
</script>

<template>
  <section class="card">
    <div class="title">Simulador de Valores de Contexto</div>

    <div class="pulse">
      <span class="pulse-unit">Frecuencia cardíaca</span>
      <span class="pulse-val">{{ data?.pulse ?? '—' }} BPM</span>
    </div>
    <label class="label" for="pulse-slider">Pulso (BPM)</label>
    <input id="pulse-slider" class="slider" type="range" min="30" max="180"
      :value="data?.pulse ?? 60"
      @change="updatePulse(($event.target as HTMLInputElement).value)" />
    <div class="range-hint"><span>Reposo</span><span>Elevado</span></div>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pulse { display: flex; justify-content: space-between; align-items: baseline; }
.pulse-unit { color: var(--muted); font-size: 13px; }
.pulse-val { font-size: 20px; font-weight: 600; }
.label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
.slider { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px;
  background: linear-gradient(90deg, #2c3a63, var(--warn)); }
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: var(--warn); box-shadow: 0 0 8px var(--warn);
}
.range-hint { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted);
}
</style>