import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: localStorage.getItem('theme') === 'dark',
  }),
  
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      // 保存到本地存储
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
      // 更新文档根元素的class
      document.documentElement.classList.toggle('dark', this.isDarkMode)
    },
    
    initTheme() {
      // 初始化主题
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark'
        document.documentElement.classList.toggle('dark', this.isDarkMode)
      } else {
        // 如果没有保存的主题，检查系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDarkMode = prefersDark
        document.documentElement.classList.toggle('dark', prefersDark)
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light')
      }
    }
  }
}) 