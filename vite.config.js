import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT:
// - For GitHub Pages, set base to "/REPO_NAME/"
// - Example: repo "biohum-visita-pwa" => base: "/biohum-visita-pwa/"
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})