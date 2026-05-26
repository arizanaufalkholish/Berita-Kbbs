import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Use an environment variable to control the base path. This allows the same
// build artefact to be deployed either at the root of a domain or under a
// sub-folder without modifying the config file directly. When
// VITE_BASE_PATH is not set, Vite will default to serving assets from '/'.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
  }
})
