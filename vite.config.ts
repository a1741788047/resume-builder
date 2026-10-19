import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 相对路径：同一份产物既能挂在域名根目录，也能放在 GitHub Pages 的 /repo/ 子路径下
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5183,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
