<template>
  <div class="floating-tools" :class="{ 'dark': isDarkMode }">
    <button 
      class="tool-btn theme-toggle"
      @click="toggleTheme"
      :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
    >
      <!-- 月亮图标 -->
      <svg 
        v-if="!isDarkMode" 
        class="icon"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      <!-- 太阳图标 -->
      <svg
        v-else
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const toggleTheme = () => {
  themeStore.toggleDarkMode()
}
</script>

<style lang="stylus" scoped>
.floating-tools {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

.tool-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #333;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
}

// 深色模式样式
.dark {
  .tool-btn {
    background: #1a1a1a;
    color: #fff;
    box-shadow: 0 2px 12px rgba(255, 255, 255, 0.1);
    
    &:hover {
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
    }
  }
}
</style> 