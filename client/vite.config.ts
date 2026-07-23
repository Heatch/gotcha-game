import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    react(),
    Icons({ compiler: 'jsx', jsx: 'react' }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
