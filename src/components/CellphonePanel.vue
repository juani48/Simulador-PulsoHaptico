<script setup lang="ts">
import type { CellphoneData } from '../types';

const props = defineProps<{ data: CellphoneData | null }>();
const emit = defineEmits<{ update: [patch: { cellphone: CellphoneData }] }>();

function update(field: keyof CellphoneData, value: string) {
  if (!props.data) return;
  const cellphone = { ...props.data, [field]: Number(value) };
  if (field === 'dateTime') {
    const currentDate = new Date().toISOString().slice(0, 10);
    cellphone.dateTime = `${currentDate}T${value}:00`;
  }
  emit('update', { cellphone });
}

function timeValue(dateTime: string | undefined): string {
  return dateTime?.match(/T(\d{2}:\d{2})/)?.[1] ?? '';
}
</script>

<template>
  <section class="card">
    <div class="title">Dispositivo móvil</div>

    <div class="label">Nivel de ruido</div>
    <div class="noise">
      <span class="noise-unit">Decibel (dB)</span>
      <span class="noise-val">{{ data?.noiseLevel ?? '—' }} dB</span>
    </div>
        <input class="slider" type="range" min="30" max="100"
              :value="data?.noiseLevel ?? 0" @change="update('noiseLevel', ($event.target as HTMLInputElement).value)" />
    <div class="range-hint"><span>Bajo</span><span>Alto</span></div>

    <div class="label">Hora</div>
    <input class="value-box" type="time" :value="timeValue(data?.dateTime)" @change="update('dateTime', ($event.target as HTMLInputElement).value)" />
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.title { margin-bottom: 4px; }
.label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
.noise { display: flex; justify-content: space-between; align-items: baseline; }
.noise-unit { color: var(--muted); font-size: 13px; }
.noise-val { font-size: 20px; font-weight: 600; }
.slider { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px;
  background: linear-gradient(90deg, #2c3a63, var(--accent)); }
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 8px var(--accent);
}
.range-hint { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
.value-box {
  background: #0e1428; border: 1px solid var(--line);
  padding: 10px 12px; border-radius: 8px; font-variant-numeric: tabular-nums;
  color: var(--text);
}
</style>