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
    <div class="title">Sector 2 · Pulse Sensor Simulation</div>

    <div class="pulse-row">
      <div class="pulse-value">
        <svg viewBox="0 0 100 40" class="wave">
          <polyline
            points="0,20 15,20 22,8 30,32 38,20 55,20 62,10 70,30 78,20 100,20"
            fill="none" stroke="var(--warn)" stroke-width="2" />
        </svg>
        <div class="bpm">{{ data?.pulse ?? '—' }} <span>BPM</span></div>
      </div>

      <div class="status" :class="{ warn: (data?.pulse ?? 0) > 100 }">
        <span class="status-dot" />
        {{ (data?.pulse ?? 0) > 100 ? 'Elevated' : 'Normal' }}
      </div>
    </div>
    <label class="label">Pulse (BPM)
      <input class="slider" type="range" min="30" max="180" :value="data?.pulse ?? 60" @change="updatePulse(($event.target as HTMLInputElement).value)" />
    </label>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pulse-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.pulse-value {
  position: relative; flex: 1; min-width: 200px;
  background: #0e1428; border: 1px solid var(--line);
  border-radius: 10px; padding: 14px 18px; overflow: hidden;
}
.wave { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .35; }
.bpm {
  position: relative; font-size: 40px; font-weight: 700; color: #fff;
  font-variant-numeric: tabular-nums;
}
.bpm span { font-size: 14px; color: var(--muted); font-weight: 500; margin-left: 6px; }
.status {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: rgba(82,226,166,.12); border: 1px solid rgba(82,226,166,.4);
  border-radius: 999px; color: var(--accent-2); font-size: 13px; font-weight: 600;
}
.status.warn {
  background: rgba(255,138,61,.12); border-color: rgba(255,138,61,.5); color: var(--warn);
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
</style>