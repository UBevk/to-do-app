import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ✅ Change this to your repo name
export default defineConfig({
  base: '/to-do-app/',
  plugins: [vue()],
})
