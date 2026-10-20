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
        </span>
      </label>
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
.profile small { color: var(--muted); font-size: 12px; }
</style>
