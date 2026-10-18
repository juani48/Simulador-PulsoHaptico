<script setup lang="ts">
import type { NeurodivergentProfile } from '../types';

const props = defineProps<{
  profiles: NeurodivergentProfile[];
  selectedProfileId: string;
}>();

const emit = defineEmits<{ select: [profileId: string] }>();
</script>

<template>
  <section class="card profile-card">
    <div class="title">Seleccionar perfil</div>
    <p class="description">Elegí la persona entrevistada para cargar su configuración en el simulador.</p>

    <div class="profiles">
      <label
        v-for="profile in props.profiles"
        :key="profile.id"
        class="profile"
        :class="{ selected: selectedProfileId === profile.id }"
      >
        <input
          type="radio"
          name="selected-profile"
          :value="profile.id"
          :checked="selectedProfileId === profile.id"
          @change="emit('select', profile.id)"
        />
        <span>
          <strong>{{ profile.name }}</strong>
          <small>Home: {{ profile.homeConfig }}<template v-if="profile.homeMessage"> · “{{ profile.homeMessage }}”</template></small>
        </span>
      </label>
    </div>

    <div v-if="props.profiles.find(profile => profile.id === selectedProfileId)" class="profile-summary">
      <template v-for="profile in props.profiles.filter(item => item.id === selectedProfileId)" :key="profile.id">
        <div class="summary-grid">
          <div><span>Regulación</span><strong>{{ profile.regulation.mode }}</strong></div>
        </div>
        <div class="profile-section"><strong>Desreguladores</strong><span>{{ profile.dysregulators.join(' · ') }}</span></div>
        <div class="profile-section"><strong>Estrategias</strong><span>{{ profile.regulation.strategies.join(' · ') }}</span></div>
        <div class="profile-section"><strong>Actividades</strong><span>{{ profile.activities.length }} cargadas</span></div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.profile-card { height: 100%; overflow-y: auto; }
.description { margin: 14px 0; color: var(--muted); font-size: 13px; }
.profiles { display: grid; gap: 10px; }
.profile { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 10px; cursor: pointer; }
.profile:hover, .profile.selected { border-color: var(--accent-2); background: rgba(82, 226, 166, .08); }
.profile input { margin-top: 3px; accent-color: var(--accent-2); }
.profile span { display: grid; gap: 4px; }
.profile strong { color: var(--text); }
.profile small, .profile-section span { color: var(--muted); font-size: 12px; }
.profile-summary { display: grid; gap: 14px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.summary-grid div { display: grid; gap: 4px; }
.summary-grid span, .profile-section strong { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
.summary-grid strong { font-size: 13px; }
.profile-section { display: grid; gap: 5px; }
@media (max-width: 600px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
