<template>
  <div class="oc-page">
    <div class="content-container">
      <!-- 左侧大图区域 -->
      <div class="main-content">
        <div class="main-image-section">
          <div class="image-wrapper">
            <img :src="mainImage.url" :alt="mainImage.title" class="main-image" @load="onMainImageLoad" />
          </div>
          <div class="image-info">
            <h2>{{ mainImage.title }}</h2>
            <p class="description">{{ mainImage.description }}</p>
            <div class="author-info">
              <img :src="mainImage.authorAvatar" alt="Author" class="avatar" />
              <span class="author-name">{{ mainImage.author }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧瀑布流 -->
        <div class="side-waterfall">
          <div class="waterfall-grid">
            <div v-for="(item, index) in sideImages" 
                :key="'side-' + index"
                class="waterfall-item"
                :style="getItemStyle(item)">
              <img :src="item.url" 
                  :alt="item.title"
                  @load="onImageLoad($event, item)" 
                  class="waterfall-image" />
              <div class="image-overlay">
                <span class="image-title">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部瀑布流 -->
      <div class="bottom-waterfall">
        <h3>更多相关内容</h3>
        <div class="waterfall-grid">
          <div v-for="(item, index) in bottomImages" 
              :key="'bottom-' + index"
              class="waterfall-item"
              :style="getItemStyle(item)">
            <img :src="item.url" 
                :alt="item.title"
                @load="onImageLoad($event, item)" 
                class="waterfall-image" />
            <div class="image-overlay">
              <span class="image-title">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';

interface ImageItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  author?: string;
  authorAvatar?: string;
  width: number;
  height: number;
  aspectRatio?: number;
}

// 生成随机图片URL的函数
const getRandomImageUrl = (width: number, height: number, id?: string) => {
  const randomId = id || Math.random().toString(36).substring(7);
  return `https://picsum.photos/${width}/${height}?random=${randomId}`;
};

// 主图数据
const mainImage = ref<ImageItem>({
  id: '1',
  url: getRandomImageUrl(1200, 800, 'main'),
  title: '示例作品标题',
  description: '这是一个充满创意的作品描述，展示了作品的独特之处和创作理念。',
  author: 'Creative Artist',
  authorAvatar: getRandomImageUrl(100, 100, 'main-avatar'),
  width: 1200,
  height: 800
});

// 侧边栏图片
const sideImages = ref<ImageItem[]>([
  {
    id: 'side-1',
    url: getRandomImageUrl(400, 500, 'side-1'),
    title: '相关作品 1',
    width: 400,
    height: 500
  },
  {
    id: 'side-2',
    url: getRandomImageUrl(400, 300, 'side-2'),
    title: '相关作品 2',
    width: 400,
    height: 300
  },
  {
    id: 'side-3',
    url: getRandomImageUrl(400, 600, 'side-3'),
    title: '相关作品 3',
    width: 400,
    height: 600
  },
  {
    id: 'side-4',
    url: getRandomImageUrl(400, 400, 'side-4'),
    title: '相关作品 4',
    width: 400,
    height: 400
  },
  {
    id: 'side-5',
    url: getRandomImageUrl(400, 550, 'side-5'),
    title: '相关作品 5',
    width: 400,
    height: 550
  },
  {
    id: 'side-6',
    url: getRandomImageUrl(400, 450, 'side-6'),
    title: '相关作品 6',
    width: 400,
    height: 450
  }
]);

// 底部图片
const bottomImages = ref<ImageItem[]>([
  {
    id: 'bottom-1',
    url: getRandomImageUrl(400, 500, 'bottom-1'),
    title: '推荐作品 1',
    width: 400,
    height: 500
  },
  {
    id: 'bottom-2',
    url: getRandomImageUrl(400, 300, 'bottom-2'),
    title: '推荐作品 2',
    width: 400,
    height: 300
  },
  {
    id: 'bottom-3',
    url: getRandomImageUrl(400, 600, 'bottom-3'),
    title: '推荐作品 3',
    width: 400,
    height: 600
  },
  {
    id: 'bottom-4',
    url: getRandomImageUrl(400, 400, 'bottom-4'),
    title: '推荐作品 4',
    width: 400,
    height: 400
  },
  {
    id: 'bottom-5',
    url: getRandomImageUrl(400, 550, 'bottom-5'),
    title: '推荐作品 5',
    width: 400,
    height: 550
  },
  {
    id: 'bottom-6',
    url: getRandomImageUrl(400, 450, 'bottom-6'),
    title: '推荐作品 6',
    width: 400,
    height: 450
  }
]);

// 图片加载完成后计算宽高比
const onImageLoad = (event: Event, item: ImageItem) => {
  const img = event.target as HTMLImageElement;
  item.aspectRatio = img.naturalWidth / img.naturalHeight;
};

const onMainImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  mainImage.value.aspectRatio = img.naturalWidth / img.naturalHeight;
};

// 计算瀑布流项目样式
const getItemStyle = (item: ImageItem) => {
  const aspectRatio = item.width / item.height;
  return {
    paddingBottom: `${(1 / aspectRatio) * 100}%`,
    backgroundColor: '#f0f0f0'
  };
};
</script>

<style lang="stylus" scoped>
.oc-page
  padding: 24px
  min-height: 100vh
  background: #fff

.content-container
  max-width: 1200px
  margin: 0 auto
  padding: 0 24px

.main-content
  display: flex
  gap: 32px
  margin-bottom: 32px
  max-width: 1260px
  margin-left: auto
  margin-right: auto

.main-image-section
  flex: 0 0 508px
  min-width: 0
  background: #fff
  border-radius: 32px
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.05)
  padding: 20px
  
  .image-wrapper
    width: 100%
    border-radius: 16px
    overflow: hidden
    margin-bottom: 16px
    
    .main-image
      width: 100%
      height: auto
      display: block
      object-fit: cover

  .image-info
    padding: 8px 0
    
    h2
      margin: 0 0 12px
      font-size: 28px
      font-weight: 600
      
    .description
      color: #211922
      margin-bottom: 16px
      line-height: 1.6
      font-size: 16px
      
    .author-info
      display: flex
      align-items: center
      gap: 12px
      margin-top: 24px
      padding-top: 16px
      border-top: 1px solid #efefef
      
      .avatar
        width: 48px
        height: 48px
        border-radius: 50%
        object-fit: cover
        
      .author-name
        font-weight: 600
        color: #211922
        font-size: 16px

.side-waterfall
  flex: 1
  min-width: 0

.bottom-waterfall
  h3
    margin: 0 0 24px
    font-size: 20px
    color: #211922
    font-weight: 600

.waterfall-grid
  display: grid
  gap: 24px
  grid-template-columns: repeat(auto-fill, minmax(236px, 1fr))

.waterfall-item
  position: relative
  width: 100%
  border-radius: 16px
  overflow: hidden
  background: #f5f5f5
  cursor: zoom-in
  
  &:hover
    .image-overlay
      opacity: 1
    
    .waterfall-image
      transform: scale(1.03)

.waterfall-image
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  object-fit: cover
  transition: transform 0.2s ease

.image-overlay
  position: absolute
  bottom: 0
  left: 0
  right: 0
  padding: 16px
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6))
  color: white
  opacity: 0
  transition: opacity 0.2s ease
  
  .image-title
    font-size: 14px
    font-weight: 500

// 响应式布局
@media (max-width: 1200px)
  .main-content
    flex-direction: column
    max-width: 800px
    
  .main-image-section
    flex: none
    width: 100%
    
  .side-waterfall
    width: 100%

@media (max-width: 768px)
  .content-container
    padding: 0 16px
    
  .waterfall-grid
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))
    gap: 16px
</style>
