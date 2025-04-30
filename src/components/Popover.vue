<template>
    <div class="popover-container" ref="container">
      <button class="trigger-btn" @click="toggle">
        <slot name="trigger">
          ⋯
        </slot>
      </button>
      <transition name="fade">
        <div
          v-if="visible"
          ref="popup"
          class="popover-content"
          @click.stop
        >
          <slot />
        </div>
      </transition>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onClickOutside, nextTick } from 'vue'
  
  const visible = ref(false)
  const container = ref<HTMLElement | null>(null)
  const popup = ref<HTMLElement | null>(null)
  
  function toggle() {
    visible.value = !visible.value
    nextTick(() => {
      updatePosition()
    })
  }
  
  function updatePosition() {
    const containerEl = container.value
    const popupEl = popup.value
    if (!containerEl || !popupEl) return
  
    const rect = containerEl.getBoundingClientRect()
    popupEl.style.top = `${rect.bottom + 8}px`
    popupEl.style.left = `${rect.left}px`
  }
  
  // 点击外部关闭
  onClickOutside(container, () => {
    visible.value = false
  })
  </script>
  
  <style scoped>
  .popover-container {
    position: relative;
    display: inline-block;
  }
  
  .trigger-btn {
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .popover-content {
    position: absolute;
    z-index: 1000;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 160px;
    max-width: 300px;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  