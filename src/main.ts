import { createApp } from 'vue';
// @ts-expect-error Vue SFC types are provided by the Vue tooling at build time.
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
