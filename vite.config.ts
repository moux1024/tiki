// Written by Claude GLM-5.1
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tiki/',
  resolve: {
    dedupe: ['zustand', 'react', 'react-dom', 'three'],
  },
})
