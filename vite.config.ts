import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': resolve(__dirname, './src/domain'),
      '@usecases': resolve(__dirname, './src/usecases'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@presentation': resolve(__dirname, './src/presentation')
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
