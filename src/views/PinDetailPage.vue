<template>
  <div class="pin-detail-page">
    <!-- 左右两列布局 -->
    <div class="two-column-layout">
      <!-- 左列：详情块 + 瀑布流A -->
      <div class="left-column">
        <!-- 详情块 -->
        <div class="detail-block" :class="{ expanded: isExpanded }" ref="detailBlock">
          <!-- 顶部导航栏 -->
          <div class="top-navigation" :class="{ sticky: isNavSticky }" ref="topNav">
            <div class="nav-left">
              <button class="nav-action" @click="goBack">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="nav-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>12</span>
              </button>
              <button class="nav-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="nav-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92S20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" 
                        fill="currentColor"/>
                </svg>
              </button>
              <button class="nav-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="19" r="2" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="nav-right">
              <select class="board-select-nav">
                <option>奇思妙想</option>
                <option>我的收藏</option>
                <option>设计灵感</option>
              </select>
              <button class="save-btn-nav" @click="handleSave">保存</button>
            </div>
          </div>
          
          <!-- 主图片容器 -->
          <div class="main-image-wrapper" :style="{ height: `${imageContainerHeight}px` }">
            <div class="main-image-container">
              <img :src="pinData.image || 'https://picsum.photos/600/800'" 
                   :alt="pinData.title" 
                   class="main-image" 
                   @load="handleImageLoad"
                   @click="openImagePreview" />
              
              <!-- 图片右下角的操作按钮 -->
              <div class="image-corner-actions">
                <button class="corner-btn expand-btn" @click.stop="toggleExpanded">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3H21V9" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 21H3V15" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 3L14 10" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 21L10 14" stroke-width="2"/>
                  </svg>
                </button>
                <button class="corner-btn share-btn">
                  分享
                </button>
              </div>
            </div>
          </div>
          
          <!-- 用户信息 -->
          <div class="user-section">
            <div class="user-avatar">
              <span>{{ (pinData.userName || 'P').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="user-info">
              <div class="user-name">{{ pinData.userName || 'PacelloLoredana' }}</div>
            </div>
          </div>
          
          <!-- 可折叠的评论区 -->
          <div class="comments-section">
            <div class="comments-toggle" @click="toggleComments">
              <span class="comments-status">{{ showComments ? '尚无评论' : '尚无评论' }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                   :class="{ rotated: showComments }" class="toggle-icon">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <!-- 可展开的评论列表 -->
            <div class="comments-expandable" :class="{ expanded: showComments }">
              <div class="comments-list" v-if="comments.length > 0">
                <div class="comment" v-for="comment in comments" :key="comment.id">
                  <div class="comment-avatar">
                    <span>{{ comment.userName.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-user">{{ comment.userName }}</span>
                      <span class="comment-time">{{ comment.time }}</span>
                    </div>
                    <p class="comment-text">{{ comment.text }}</p>
                    <div class="comment-actions">
                      <button class="comment-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        {{ comment.likes || 0 }}
                      </button>
                      <button class="comment-action">回复</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 添加评论 -->
              <div class="add-comment">
                <input type="text" 
                       placeholder="添加评论" 
                       v-model="newComment"
                       @keyup.enter="addComment"
                       class="comment-input" />
                <button class="emoji-btn">😊</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 左列瀑布流A -->
        <div class="left-masonry">
          <MasonryList
            :fetch-data="fetchLeftPins"
            :column-count="leftColumns"
            :column-gap="12"
            :row-gap="16"
            :page-size="20"
            @error="handleError"
          />
        </div>
      </div>
      
      <!-- 右列：瀑布流B -->
      <div class="right-column">
        <MasonryList
          :fetch-data="fetchRightPins"
          :column-count="rightColumns"
          :column-gap="12"
          :row-gap="16"
          :page-size="30"
          @error="handleError"
        />
      </div>
    </div>
    
    <!-- 图片预览窗口 -->
    <div class="image-preview-overlay" v-if="showImagePreview" @click="closeImagePreview">
      <div class="image-preview-container">
        <!-- 预览图片 -->
        <div class="preview-image-wrapper" @click.stop>
          <img :src="pinData.image || 'https://picsum.photos/600/800'" 
               :alt="pinData.title"
               class="preview-image"
               :style="{ transform: `scale(${imageScale})` }" />
        </div>
        
        <!-- 底部控制栏 -->
        <div class="preview-controls">
          <button class="control-btn" @click.stop="zoomOut">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
              <path d="M8 11h6" stroke="white" stroke-width="2"/>
            </svg>
          </button>
          <span class="zoom-level">{{ Math.round(imageScale * 100) }}%</span>
          <button class="control-btn" @click.stop="zoomIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2"/>
              <path d="M8 11h6M11 8v6" stroke="white" stroke-width="2"/>
            </svg>
          </button>
          <button class="control-btn reset-btn" @click.stop="resetZoom">
            重置
          </button>
          <button class="control-btn close-btn" @click.stop="closeImagePreview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-ignore - Vue 3 script setup组件导入问题
import MasonryList from '@/components/MasonryList.vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const detailBlock = ref<HTMLElement>()
const topNav = ref<HTMLElement>()

// 布局相关的响应式变量
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)
const isNavSticky = ref(false)
const imageContainerHeight = ref(600)

// 图片预览相关
const showImagePreview = ref(false)
const imageScale = ref(1)

const pinData = ref({
  id: '',
  title: '',
  description: '',
  image: '',
  userName: '',
  userId: '',
  width: 0,
  height: 0,
  website: ''
})

const newComment = ref('')
const isExpanded = ref(false)
const showComments = ref(false) // 默认收起评论

// 计算左右列的列数
const leftColumns = computed(() => {
  if (windowWidth.value < 768) return 2
  if (windowWidth.value < 1024) return 3
  if (windowWidth.value < 1280) return 3
  return 4
})

const rightColumns = computed(() => {
  if (windowWidth.value < 768) return 2
  if (windowWidth.value < 1024) return 3
  if (windowWidth.value < 1280) return 4
  return 5
})

// 计算合适的图片容器高度
const calculateImageHeight = () => {
  const navHeight = 60 // 导航栏高度
  const userSectionHeight = 80 // 用户信息区域高度
  const commentsHeaderHeight = 50 // 评论标题高度
  const padding = 40 // 上下padding
  
  const availableHeight = windowHeight.value - navHeight - userSectionHeight - commentsHeaderHeight - padding
  const maxImageHeight = Math.floor(availableHeight * 0.8) // 最多占80%的可用高度
  
  imageContainerHeight.value = Math.max(400, Math.min(800, maxImageHeight))
}

// 定义评论类型
type Comment = {
  id: number;
  userName: string;
  text: string;
  time: string;
  likes: number;
}

const comments = ref<Comment[]>([
  // 注释掉评论数据，显示"尚无评论"
  // {
  //   id: 1,
  //   userName: 'RVLERZREACH4N',
  //   text: 'The human tardis would rock those heels',
  //   time: '3周',
  //   likes: 8
  // }
])

const goBack = () => {
  router.go(-1)
}

const handleSave = () => {
  console.log('保存Pin:', pinData.value.id)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  console.log('切换展开状态:', isExpanded.value)
}

const toggleComments = () => {
  showComments.value = !showComments.value
}

const handleImageLoad = () => {
  console.log('图片加载完成')
}

const handleUserClick = () => {
  if (pinData.value.userId) {
    router.push(`/user/${pinData.value.userId}`)
  }
}

const addComment = () => {
  if (newComment.value.trim()) {
    comments.value.push({
      id: Date.now(),
      userName: '当前用户',
      text: newComment.value,
      time: '刚刚',
      likes: 0
    })
    newComment.value = ''
  }
}

// 图片预览相关方法
const openImagePreview = () => {
  showImagePreview.value = true
  imageScale.value = 1
  document.body.style.overflow = 'hidden' // 禁止页面滚动
}

const closeImagePreview = () => {
  showImagePreview.value = false
  imageScale.value = 1
  document.body.style.overflow = 'auto' // 恢复页面滚动
}

const zoomIn = () => {
  imageScale.value = Math.min(imageScale.value + 0.25, 3) // 最大3倍
}

const zoomOut = () => {
  imageScale.value = Math.max(imageScale.value - 0.25, 0.25) // 最小0.25倍
}

const resetZoom = () => {
  imageScale.value = 1
}

// 修改滚动监听，让导航栏只在详情块内固定
const handleScroll = () => {
  if (detailBlock.value && topNav.value) {
    const detailRect = detailBlock.value.getBoundingClientRect()
    const scrollTop = detailBlock.value.scrollTop
    
    // 当详情块内部滚动超过导航栏高度时，固定导航栏
    isNavSticky.value = scrollTop > 0
  }
}

const fetchPinDetail = async (id: string) => {
  try {
    const response = await request.get(`/pins/${id}`)
    pinData.value = response.data
  } catch (error) {
    console.error('获取Pin详情失败:', error)
  }
}

// 获取左列瀑布流数据
const fetchLeftPins = async (page: number, pageSize: number) => {
  try {
    const response = await request.get(
      `/pins/related/left?pinId=${pinData.value.id}&page=${page}&pageSize=${pageSize}`
    )
    return { data: response.data.list }
  } catch (error) {
    console.error('获取左列Pin失败:', error)
    
    // 返回mock数据
    const mockData = Array.from({ length: pageSize }, (_, index) => {
      const globalIndex = (page - 1) * pageSize + index;
      // 减少跨列项目的频率，确保分布合理
      const shouldSpan = Math.random() < 0.12 && globalIndex % 8 === 0; // 约12%概率，每8个一个
      const shouldHideText = Math.random() < 0.3;
      
      // 根据当前左列列数计算合适的跨列数
      const maxSpan = Math.min(leftColumns.value, 3); // 最大跨3列
      const spanCount = shouldSpan ? Math.min(2 + Math.floor(Math.random() * 2), maxSpan) : 1;
      
      return {
        id: `left-${globalIndex}`,
        title: `左列内容 ${globalIndex + 1}`,
        content: `这是第${globalIndex + 1}个左列内容`,
        description: `左列描述 ${globalIndex + 1}`,
        image: `https://picsum.photos/${300 + Math.floor(Math.random() * 200)}/${200 + Math.floor(Math.random() * 300)}?random=${globalIndex + 2000}`,
        userName: `左列用户${globalIndex + 1}`,
        userId: `left-user-${globalIndex}`,
        width: 300 + Math.floor(Math.random() * 100),
        height: 200 + Math.floor(Math.random() * 300),
        columnSpan: spanCount,
        isHide: shouldHideText
      };
    });
    
    return { data: mockData };
  }
}

// 获取右列瀑布流数据
const fetchRightPins = async (page: number, pageSize: number) => {
  try {
    const response = await request.get(
      `/pins/related/right?pinId=${pinData.value.id}&page=${page}&pageSize=${pageSize}`
    )
    return { data: response.data.list }
  } catch (error) {
    console.error('获取右列Pin失败:', error)
    
    // 返回mock数据
    const mockData = Array.from({ length: pageSize }, (_, index) => {
      const globalIndex = (page - 1) * pageSize + index;
      // 右列跨列项目频率稍高一些
      const shouldSpan = Math.random() < 0.15 && globalIndex % 6 === 0; // 约15%概率，每6个一个
      const shouldHideText = Math.random() < 0.25;
      
      // 根据当前右列列数计算合适的跨列数
      const maxSpan = Math.min(rightColumns.value, 4); // 最大跨4列
      const spanCount = shouldSpan ? Math.min(2 + Math.floor(Math.random() * 2), maxSpan) : 1;
      
      return {
        id: `right-${globalIndex}`,
        title: `右列内容 ${globalIndex + 1}`,
        content: `这是第${globalIndex + 1}个右列内容`,
        description: `右列描述 ${globalIndex + 1}`,
        image: `https://picsum.photos/${300 + Math.floor(Math.random() * 200)}/${200 + Math.floor(Math.random() * 300)}?random=${globalIndex + 3000}`,
        userName: `右列用户${globalIndex + 1}`,
        userId: `right-user-${globalIndex}`,
        width: 300 + Math.floor(Math.random() * 100),
        height: 200 + Math.floor(Math.random() * 300),
        columnSpan: spanCount,
        isHide: shouldHideText
      };
    });
    
    return { data: mockData };
  }
}

// 监听窗口大小变化
const updateWindowSize = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  calculateImageHeight()
}

const handleError = (error: Error) => {
  console.error('加载出错:', error)
}

onMounted(() => {
  const pinId = route.params.id as string
  if (pinId) {
    fetchPinDetail(pinId)
  }
  
  // 初始化图片高度
  calculateImageHeight()
  
  // 添加事件监听
  window.addEventListener('resize', updateWindowSize)
  
  // 为详情块添加滚动监听
  if (detailBlock.value) {
    detailBlock.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
  
  // 移除详情块滚动监听
  if (detailBlock.value) {
    detailBlock.value.removeEventListener('scroll', handleScroll)
  }
  
  // 确保关闭预览时恢复页面滚动
  document.body.style.overflow = 'auto'
})
</script>

<style lang="stylus" scoped>
.pin-detail-page {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.two-column-layout {
  display: flex;
  gap: 24px;
  max-width: 100vw;
  align-items: flex-start;
}

.left-column {
  flex: 1;
  max-width: 50%;
}

.right-column {
  flex: 1;
  max-width: 50%;
}

.detail-block {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  margin-bottom: 24px;
  max-height: 100vh;
  overflow-y: auto;
  position: relative; // 为sticky定位提供参照
  
  &.expanded {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    max-width: 1200px !important;
    max-height: 90vh !important;
    z-index: 2000 !important;
    
    .main-image {
      max-height: 70vh;
      object-fit: contain;
    }
  }
}

.top-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e1e1e1;
  background: white;
  z-index: 100;
  
  &.sticky {
    position: sticky;
    top: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-action {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  
  &:hover {
    background: #f1f1f1;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.board-select-nav {
  padding: 12px 16px;
  border: 2px solid #cdcdcd;
  border-radius: 24px;
  background: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #767676;
  }
  
  &:focus {
    outline: none;
    border-color: #e60023;
  }
}

.save-btn-nav {
  background: #e60023;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  
  &:hover {
    background: #ad081b;
  }
}

.main-image-wrapper {
  position: relative;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px; // 左右留白
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
}

.image-corner-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.corner-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
  
  &.expand-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    padding: 0;
    justify-content: center;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #e1e1e1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.comments-section {
  padding: 0 20px 20px;
}

.comments-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
}

.comments-status {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.toggle-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  color: #767676;
  
  &.rotated {
    transform: rotate(180deg);
  }
}

.comments-expandable {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  &.expanded {
    max-height: 1000px;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.comment {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.comment-user {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #767676;
}

.comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action {
  background: none;
  border: none;
  color: #767676;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: #333;
  }
}

.add-comment {
  position: relative;
  margin-top: 20px;
}

.comment-input {
  width: 100%;
  padding: 16px 50px 16px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 24px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #e60023;
  }
}

.emoji-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    background: #f1f1f1;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .two-column-layout {
    flex-direction: column;
    gap: 20px;
  }
  
  .left-column, .right-column {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .pin-detail-page {
    padding: 16px;
  }
  
  .save-section {
    flex-direction: column;
  }
  
  .board-select {
    margin-bottom: 8px;
  }
  
  .user-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

// 图片预览窗口样式
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  padding: 40px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.preview-controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 24px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.control-btn {
  background: none;
  border: none;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  &.reset-btn {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }
  
  &.close-btn {
    background: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.zoom-level {
  color: white;
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}
</style> 