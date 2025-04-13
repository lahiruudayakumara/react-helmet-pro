import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'react-helmet-pro': path.resolve(__dirname, '../src'),
    },
  },
})