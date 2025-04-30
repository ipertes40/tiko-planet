<template>
    <!-- 仿hexo butterfly 布局 -->

    <!-- 最上方使用滚动视差首页动画  -->
    <div>
    <!-- 封面区域 -->
    <section ref="hero" class="hero-section">
      <div class="hero-content">
        <h1>世界观与方法论</h1>
        <p>Write a story, and then fill it with your life.</p>
        <div class="scroll-down" @click="scrollToContent">
          ⌄
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section ref="mainContent" class="main-section">
      <!-- 你的主要内容放这里 -->
      <slot></slot>
    </section>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const hero = ref<HTMLElement | null>(null)
const mainContent = ref<HTMLElement | null>(null)

const scrollToContent = () => {
  if (mainContent.value) {
    const offsetTop = mainContent.value.offsetTop
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  }
}
</script>



<style>
.hero-section {
  height: 100vh;
  background: url('/your-bg.jpg') center center / cover no-repeat;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.6s ease;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  color: white;
  z-index: 2;
}

.scroll-down {
  position: absolute;
  bottom: 40px;
  font-size: 2rem;
  animation: bounce 1.5s infinite;
  cursor: pointer;
}

/* 简单的箭头动效 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(10px);
  }
}

.main-section {
  background-color: #111;
  color: white;
  padding: 60px 20px;
}
</style>