<template>
  <div class="home-page">
    <div class="masonry-container" ref="containerRef">
      <!-- 列数控制 -->
      <div class="controls">
        <div class="control-group">
          <label>列数：</label>
          <select v-model="columnCount" @change="recalculateLayout">
            <option :value="2">2列</option>
            <option :value="3">3列</option>
            <option :value="4">4列</option>
            <option :value="5">5列</option>
            <option :value="6">6列</option>
          </select>
        </div>
        
        <div class="stats">
          <span class="stat-item">
            总计: {{ pins.length }} 张
          </span>
          <span class="stat-item">
            已加载: {{ pins.filter(p => p.loaded).length }} 张
          </span>
          <span class="stat-item" v-if="pins.some(p => (p.columnSpan || 1) > 1)">
            跨列: {{ pins.filter(p => (p.columnSpan || 1) > 1).length }} 张
          </span>
        </div>
      </div>
      
      <!-- 瀑布流内容 -->
      <div class="masonry" ref="masonryRef" :style="{ height: containerHeight + 'px' }">
        <div v-for="(pin, index) in pins" 
            :key="pin.id" 
            class="masonry-item"
            :style="pin.style"
            @click="openPinDetail(pin)"
            :data-span="pin.columnSpan || 1">
          <div class="pin-container">
            <!-- 骨架图占位 -->
            <div v-if="!pin.loaded" class="skeleton-placeholder" :style="getSkeletonStyle(pin)">
              <div class="skeleton-image"></div>
            </div>
            <!-- 实际图片 -->
            <img 
              v-show="pin.loaded"
              :src="pin.image" 
              :alt="pin.title"
              @load="onImageLoaded(pin, index)"
              @error="onImageError(pin, index)"
              class="pin-image"
            />
            <div v-show="pin.loaded" class="pin-overlay">
              <div class="pin-actions">
                <button class="save-button">保存</button>
                <div class="action-icons">
                  <span class="icon">⋯</span>
                  <span class="icon">↗</span>
                </div>
              </div>
              <div class="pin-info">
                <h3>{{ pin.title }}</h3>
                <div class="author">
                  <img :src="getRandomImage(50, 50, pin.id + '-avatar')" :alt="pin.userName" class="author-avatar" />
                  <span>{{ pin.userName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多触发器 -->
      <div ref="loadTrigger" class="load-trigger">
        <div v-if="loading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="noMore" class="no-more">
          没有更多内容了
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Pin {
  id: string
  image: string
  title: string
  content: string
  userName: string
  width: number
  height: number
  loaded?: boolean
  columnSpan?: number // 跨列数，默认为1
  skeletonColor?: string // 骨架图背景色
  style?: {
    position: 'absolute'
    left: string
    top: string
    width: string
  }
}

const pins = ref<Pin[]>([])
const loading = ref(false)
const noMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const loadTrigger = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const masonryRef = ref<HTMLElement>()
const columnCount = ref(4)
const columnWidth = ref(0)
const columnHeights = ref<number[]>([])
const containerHeight = ref(0)
const gap = ref(16)

let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

// 生成随机图片的辅助函数
const getRandomImage = (width: number, height: number, id: string) => {
  return `https://picsum.photos/${width}/${height}?random=${id}`
}

// 生成柔和的随机颜色
const generateSoftColor = () => {
  const hue = Math.floor(Math.random() * 360) // 任意色相
  const saturation = Math.floor(Math.random() * 30) + 10 // 10-40% 饱和度
  const lightness = Math.floor(Math.random() * 20) + 80 // 80-100% 亮度
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// 计算骨架图样式
const getSkeletonStyle = (pin: Pin) => {
  const aspectRatio = pin.height / pin.width
  return {
    paddingBottom: `${aspectRatio * 100}%`,
    backgroundColor: pin.skeletonColor
  }
}

// 计算列宽
const calculateColumnWidth = () => {
  if (!containerRef.value) return
  
  const containerWidth = containerRef.value.offsetWidth - 32 // 减去padding
  const totalGap = (columnCount.value - 1) * gap.value
  columnWidth.value = Math.floor((containerWidth - totalGap) / columnCount.value)
}

// 初始化列高度数组
const initializeColumns = () => {
  columnHeights.value = new Array(columnCount.value).fill(0)
}

// 计算单个元素的位置（支持跨列）
const calculateItemPosition = (pin: Pin, itemHeight: number) => {
  const span = pin.columnSpan || 1
  const maxSpan = Math.min(span, columnCount.value)
  
  // 找到能容纳跨列元素的最佳位置
  let bestColumnIndex = 0
  let minMaxHeight = Infinity
  
  for (let i = 0; i <= columnCount.value - maxSpan; i++) {
    const maxHeightInSpan = Math.max(...columnHeights.value.slice(i, i + maxSpan))
    if (maxHeightInSpan < minMaxHeight) {
      minMaxHeight = maxHeightInSpan
      bestColumnIndex = i
    }
  }
  
  // 计算位置
  const left = bestColumnIndex * (columnWidth.value + gap.value)
  const top = minMaxHeight
  const width = maxSpan * columnWidth.value + (maxSpan - 1) * gap.value
  
  // 更新所有跨越的列的高度
  for (let i = bestColumnIndex; i < bestColumnIndex + maxSpan; i++) {
    columnHeights.value[i] = top + itemHeight + gap.value
  }
  
  // 更新容器高度
  containerHeight.value = Math.max(...columnHeights.value)
  
  return {
    position: 'absolute' as const,
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`
  }
}

// 重新计算整个布局
const recalculateLayout = () => {
  calculateColumnWidth()
  initializeColumns()
  
  // 重新布局所有元素（包括未加载的）
  pins.value.forEach((pin) => {
    const aspectRatio = pin.height / pin.width
    const span = pin.columnSpan || 1
    const actualWidth = span * columnWidth.value + (span - 1) * gap.value
    const imageHeight = actualWidth * aspectRatio
    const itemHeight = imageHeight + 60
    
    pin.style = calculateItemPosition(pin, itemHeight)
  })
}

// 生成测试数据
const generatePins = (page: number, size: number) => {
  const newPins: Pin[] = []
  const startIndex = (page - 1) * size
  
  for (let i = 0; i < size; i++) {
    const index = startIndex + i
    const width = Math.floor(Math.random() * 500) + 300 // 300-800px
    const height = Math.floor(Math.random() * 300) + 600 // 600-900px
    const id = `${index + 1}`
    
    // 随机决定是否跨列（10%概率跨2列，5%概率跨3列）
    let columnSpan = 1
    const random = Math.random()
    if (random < 0.05 && columnCount.value >= 3) {
      columnSpan = 3
    } else if (random < 0.15 && columnCount.value >= 2) {
      columnSpan = 2
    }
    
    const pin: Pin = {
      id: id,
      image: getRandomImage(width, height, id),
      title: `创意作品 ${index + 1}`,
      content: '这是一个充满创意的作品描述...',
      userName: `创作者 ${index + 1}`,
      width: width,
      height: height,
      loaded: false,
      columnSpan: columnSpan,
      skeletonColor: generateSoftColor()
    }
    
    // 立即计算位置（包括骨架图）
    const aspectRatio = pin.height / pin.width
    const actualWidth = columnSpan * columnWidth.value + (columnSpan - 1) * gap.value
    const imageHeight = actualWidth * aspectRatio
    const itemHeight = imageHeight + 60
    
    pin.style = calculateItemPosition(pin, itemHeight)
    
    newPins.push(pin)
  }
  
  return newPins
}

// 加载更多数据
const loadMorePins = async () => {
  if (loading.value || noMore.value) return
  
  loading.value = true
  
  try {
    // 确保列宽已计算
    if (columnWidth.value === 0) {
      calculateColumnWidth()
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const startIndex = pins.value.length
    const newPins = generatePins(currentPage.value, pageSize.value)
    
    if (newPins.length === 0) {
      noMore.value = true
      return
    }
    
    pins.value.push(...newPins)
    currentPage.value++
    
    // 如果返回的数据少于页面大小，说明没有更多数据了
    if (newPins.length < pageSize.value) {
      noMore.value = true
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 图片加载完成
const onImageLoaded = (pin: Pin, index: number) => {
  pin.loaded = true
  // 位置已经在生成时计算好了，不需要重新计算
}

// 图片加载失败
const onImageError = (pin: Pin, index: number) => {
  console.error('图片加载失败:', pin.image)
  pin.loaded = true
  // 位置已经在生成时计算好了，不需要重新计算
}

// 设置滚动监听
const setupIntersectionObserver = () => {
  if (!loadTrigger.value) return
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading.value && !noMore.value) {
          loadMorePins()
        }
      })
    },
    {
      rootMargin: '100px'
    }
  )
  
  observer.observe(loadTrigger.value)
}

// 设置窗口大小监听
const setupResizeObserver = () => {
  if (!containerRef.value) return
  
  resizeObserver = new ResizeObserver(() => {
    recalculateLayout()
  })
  
  resizeObserver.observe(containerRef.value)
}

// 打开详情页
const openPinDetail = (pin: Pin) => {
  router.push({
    name: 'oc',
    params: { id: pin.id }
  })
}

// 监听列数变化
watch(columnCount, () => {
  recalculateLayout()
})

onMounted(async () => {
  calculateColumnWidth()
  initializeColumns()
  
  // 初始加载
  await loadMorePins()
  
  // 设置监听器
  nextTick(() => {
    setupIntersectionObserver()
    setupResizeObserver()
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style lang="stylus" scoped>
.home-page
  padding: 24px
  background-color: #fff

.masonry-container
  max-width: 1800px
  margin: 0 auto
  padding: 0 16px

.controls
  margin-bottom: 24px
  display: flex
  justify-content: space-between
  align-items: center
  padding: 16px 20px
  background: white
  border-radius: 12px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)
  border: 1px solid #f0f0f0
  
  .control-group
    display: flex
    align-items: center
    gap: 12px
    
    label
      font-weight: 600
      color: #333
      font-size: 14px
      
    select
      padding: 8px 12px
      border: 1px solid #ddd
      border-radius: 8px
      background: white
      font-size: 14px
      cursor: pointer
      min-width: 80px
      
      &:focus
        outline: none
        border-color: #e60023
        box-shadow: 0 0 0 3px rgba(230, 0, 35, 0.1)
  
  .stats
    display: flex
    gap: 20px
    
    .stat-item
      font-size: 13px
      color: #666
      padding: 4px 8px
      background: #f8f9fa
      border-radius: 6px
      font-weight: 500

.masonry
  position: relative
  width: 100%

.masonry-item
  position: absolute
  cursor: zoom-in
  transition: transform 0.2s ease
  
  &:hover
    transform: translateY(-2px)
    z-index: 10
  
  // 跨列图片的特殊样式
  &[data-span="2"]
    .pin-container
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1)
      
  &[data-span="3"]
    .pin-container
      box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15)
      border: 2px solid rgba(230, 0, 35, 0.1)

.pin-container
  position: relative
  border-radius: 16px
  overflow: hidden
  transition: box-shadow 0.3s ease
  
  &:hover
    .pin-overlay
      opacity: 1
    
    .pin-image
      filter: brightness(0.8)

.skeleton-placeholder
  position: relative
  width: 100%
  border-radius: 16px
  overflow: hidden
  
  .skeleton-image
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: linear-gradient(
      90deg,
      transparent 25%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 75%
    )
    background-size: 200% 100%
    animation: skeleton-loading 1.8s ease-in-out infinite
    
    &::before
      content: ''
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.1) 100%
      )
      opacity: 0.6

@keyframes skeleton-loading
  0%
    background-position: 200% 0
  100%
    background-position: -200% 0

.pin-image
  width: 100%
  display: block
  transition: filter 0.2s ease

.pin-overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.4))
  opacity: 0
  transition: opacity 0.2s ease
  display: flex
  flex-direction: column
  justify-content: space-between
  padding: 12px

.pin-actions
  display: flex
  justify-content: space-between
  align-items: flex-start
  
  .save-button
    background: #e60023
    color: white
    border: none
    padding: 8px 16px
    border-radius: 24px
    font-weight: 600
    cursor: pointer
    
    &:hover
      background: #ad081b

  .action-icons
    display: flex
    gap: 8px
    
    .icon
      width: 32px
      height: 32px
      background: rgba(255,255,255,0.9)
      border-radius: 50%
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer
      
      &:hover
        background: white

.pin-info
  color: white
  
  h3
    margin: 0
    font-size: 14px
    margin-bottom: 4px
    
  .author
    display: flex
    align-items: center
    gap: 8px
    font-size: 12px
    
    .author-avatar
      width: 24px
      height: 24px
      border-radius: 50%
      object-fit: cover

.load-trigger
  width: 100%
  padding: 40px 0
  display: flex
  justify-content: center
  align-items: center

.loading-indicator
  display: flex
  flex-direction: column
  align-items: center
  gap: 16px
  color: #666
  
  .loading-spinner
    width: 32px
    height: 32px
    border: 3px solid #f3f3f3
    border-top: 3px solid #e60023
    border-radius: 50%
    animation: spin 1s linear infinite

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.no-more
  color: #999
  font-size: 14px
  text-align: center
  padding: 20px
</style> 