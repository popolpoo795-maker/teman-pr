import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const [owner, repository] = (process.env.GITHUB_REPOSITORY ?? '').split('/')
const base = process.env.GITHUB_ACTIONS && repository && repository !== `${owner}.github.io`
  ? `/${repository}/`
  : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Teman PR — Planner Tugas Sekolah',
        short_name: 'Teman PR',
        description: 'Atur tugas sekolah, tenggat, dan prioritas dalam satu tempat.',
        lang: 'id-ID',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f7f8f4',
        theme_color: '#f7f8f4',
        icons: [
          { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}pwa-maskable-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
})
