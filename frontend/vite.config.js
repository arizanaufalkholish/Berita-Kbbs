/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Use an environment variable to control the base path. This allows the same
// build artefact to be deployed either at the root of a domain or under a
// sub-folder without modifying the config file directly. When
// VITE_BASE_PATH is not set, Vite will default to serving assets from '/'.
const basePath = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
})
