import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        chihiroModel: new URL('./chihiro-model.html', import.meta.url).pathname,
      },
    },
  },
}));
