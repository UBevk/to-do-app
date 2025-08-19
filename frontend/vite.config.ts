import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/to-do-app/',
  plugins: [vue()],
})
