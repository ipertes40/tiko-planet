<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <div id="app">
    <router-view />
    <FloatingTools />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import FloatingTools from '@/components/FloatingTools.vue'
import { useThemeStore } from '@/store/theme'
import '@/styles/dark-theme.css'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
})
</script>

<style lang="stylus">
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 重置一些默认样式 */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* 确保所有元素的过渡效果平滑 */
* {
  transition: background-color 0.3s ease, 
             color 0.3s ease, 
             border-color 0.3s ease, 
             box-shadow 0.3s ease;
}

/* 链接样式 */
a {
  color: inherit;
  text-decoration: none;
  
  &:hover {
    color: var(--primary-color);
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

/* 深色模式下的滚动条 */
:root.dark {
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
