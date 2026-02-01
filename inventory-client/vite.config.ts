import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 关键配置：让本地前端可以访问远程后端
      '/api': {
        target: 'http://124.220.174.240:3000', // 你的远程后端 IP
        changeOrigin: true,
      }
    }
  }
})