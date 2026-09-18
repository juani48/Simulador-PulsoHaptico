<script setup lang="ts">
import { computed } from 'vue';
import type { CellphoneData } from '../types';

const props = defineProps<{ data: CellphoneData | null }>();
const emit = defineEmits<{ update: [patch: { cellphone: CellphoneData }] }>();

function update(field: keyof CellphoneData, value: string) {
  if (!props.data) return;
  const cellphone = { ...props.data, [field]: Number(value) };
  if (field === 'dateTime') cellphone.dateTime = new Date(value).toISOString();
  emit('update', { cellphone });
}

function updatePosition(field: 'lat' | 'lon', value: string) {
  if (!props.data) return;
  emit('update', {
    cellphone: { ...props.data, position: { ...props.data.position, [field]: Number(value) } }
  });
}

const mapUrl = computed(() => {
  if (!props.data) return '';
  const { lat, lon } = props.data.position;
  const d = 0.003;
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
});

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('es-AR', { hour12: false }) : '—';
</script>

<template>
  <section class="card">
    <div class="title">Sector 1 · Cellphone Simulation</div>

    <div class="label">Position</div>
    <div class="coordinates-inputs" v-if="data">
      <label>Lat <input type="number" step="0.0001" :value="data.position.lat" @change="updatePosition('lat', ($event.target as HTMLInputElement).value)" /></label>
      <label>Lon <input type="number" step="0.0001" :value="data.position.lon" @change="updatePosition('lon', ($event.target as HTMLInputElement).value)" /></label>
    </div>
    <div class="map-wrap">
      <iframe v-if="mapUrl" :src="mapUrl" />
      <div v-else class="placeholder">Sin datos</div>
      <div class="coords" v-if="data">
        <div><b>Lat:</b> {{ data.position.lat.toFixed(4) }}</div>
        <div><b>Lon:</b> {{ data.position.lon.toFixed(4) }}</div>
      </div>
    </div>

    <div class="label">Noise Level</div>
    <div class="noise">
      <span class="noise-unit">decibel (dB)</span>
      <span class="noise-val">{{ data?.noiseLevel ?? '—' }} dB</span>
    </div>
        <input class="slider" type="range" min="30" max="100"
              :value="data?.noiseLevel ?? 0" @change="update('noiseLevel', ($event.target as HTMLInputElement).value)" />
    <div class="range-hint"><span>Quiet</span><span>Loud</span></div>

    <div class="label">Date &amp; Time</div>
    <input class="value-box" type="datetime-local" :value="data?.dateTime.slice(0, 16)" @change="update('dateTime', ($event.target as HTMLInputElement).value)" />

    <div class="label">Nearby People</div>
    <input class="number-input" type="number" min="0" max="100" :value="data?.nearbyPeople ?? 0" @change="update('nearbyPeople', ($event.target as HTMLInputElement).value)" />
    <div class="people">
      <div class="people-count">{{ data?.nearbyPeople ?? 0 }}</div>
      <div class="people-dots">
        <span v-for="i in Math.min(data?.nearbyPeople ?? 0, 12)" :key="i" class="person-dot" />
        <span v-if="(data?.nearbyPeople ?? 0) > 12" class="more">
          +{{ (data!.nearbyPeople - 12) }}
        </span>
      </div>
    </div>
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
.map-wrap { position: relative; border-radius: 10px; overflow: hidden; height: 150px; border: 1px solid var(--line); }
.map-wrap iframe { width: 100%; height: 100%; border: 0; filter: grayscale(.4) contrast(1.1); }
.placeholder { height: 100%; display: grid; place-items: center; color: var(--muted); }
.coords {
  position: absolute; right: 8px; top: 8px;
  background: rgba(10,15,30,.85); border: 1px solid var(--line);
  padding: 6px 10px; border-radius: 8px; font-size: 12px; display: grid; gap: 2px;
}
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
}
.coordinates-inputs { display: flex; gap: 8px; }
.coordinates-inputs label, .number-input { color: var(--muted); font-size: 12px; }
.coordinates-inputs input, .number-input {
  width: 100%; box-sizing: border-box; margin-top: 4px; padding: 8px 10px;
  color: inherit; background: #0e1428; border: 1px solid var(--line); border-radius: 8px;
}
.coordinates-inputs label { flex: 1; }
.people { display: flex; align-items: center; gap: 14px; }
.people-count { font-size: 34px; font-weight: 700; color: var(--accent); }
.people-dots { display: flex; flex-wrap: wrap; gap: 5px; }
.person-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent-2); box-shadow: 0 0 6px var(--accent-2); }
.more { color: var(--muted); font-size: 12px; }
</style>