import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,  // 自定义端口
    open: true   // 自动打开浏览器
  },
  resolve: {
    alias: {
      '@': '/src'  // 配置路径别名
    }
  }
})
