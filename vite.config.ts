import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = env.APP_PORT ?? '8080';

  return {
    plugins: [vue()],
    server: {
      port: 5174,
      proxy: { '/api': `http://localhost:${serverPort}` }
    },
    build: { outDir: 'dist' }
  };
});
