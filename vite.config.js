import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    sourcemap: false,
    minify: 'esbuild',
    lib: {
      entry: ['src/main.ts'],
      fileName: (format, entryName) => `image_glitch.${format}.js`,
      name: 'ImageGlitch',
    },
    rollupOptions: {
      external: ['pixi.js', 'pixi-filters'],
      output: {
        globals: {
          'pixi.js': `PIXI`,
          'pixi-filters': 'PIXI.filters',
        },
      },
    },
  },
});