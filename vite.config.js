import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const [owner, repository] = (process.env.GITHUB_REPOSITORY ?? '').split('/')
const base = process.env.GITHUB_ACTIONS && repository && repository !== `${owner}.github.io`
  ? `/${repository}/`
  : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
