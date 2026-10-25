import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.API_BASE_URL || env.VITE_API_BASE_URL || ''

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      '__API_BASE_URL__': JSON.stringify(rawApiUrl),
    },
    envPrefix: ['VITE_', 'API_'],
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1500,
    },
  }
})
