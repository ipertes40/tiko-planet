<template>
  <div class="article-list-page">
    <!-- 临时调试信息 -->
    <!-- <div class="debug-info">
      <p>当前列数: {{ columnCount }}</p>
      <p>窗口宽度: {{ windowWidth }}</p>
    </div> -->
    
    <MasonryList
      :fetch-data="fetchArticles"
      :column-gap="16"
      :row-gap="24"
      :column-count="columnCount"
      :page-size="20"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
// @ts-ignore - Vue 3 script setup组件导入问题
import MasonryList from '@/components/MasonryList.vue'
import request from '@/utils/request'

const columnCount = ref(7) // 测试：设置为3列
const windowWidth = ref(window.innerWidth)

// 响应式列数
const updateColumnCount = () => {
  const width = window.innerWidth
  windowWidth.value = width
  
  if (width < 768) {
    columnCount.value = 2
  } else if (width < 1024) {
    columnCount.value = 3
  } else if (width < 1280) {
    columnCount.value = 4
  } else if (width < 1536) {
    columnCount.value = 5
  } else {
    columnCount.value = 7
  }
  console.log('窗口宽度:', width, '列数:', columnCount.value)
}

const fetchArticles = async (page: number, pageSize: number) => {
  try {
    const response = await request.get(
      `/articles?page=${page}&pageSize=${pageSize}`
    );
    console.log("response==>", response)
    const { data } = response;
    
    // 确保数据格式符合Pinterest风格
    const formattedData = data.list.map((item: any, index: number) => {
      // 每10个项目中随机插入1-2个跨列项目
      const shouldSpan = Math.random() < 0.15 && index % 5 === 0;
      const shouldHideText = Math.random() < 0.3; // 30%概率隐藏文字
      
      return {
        ...item,
        userName: item.userName || '匿名用户',
        description: item.description || item.content,
        // 确保有合适的宽高比
        width: item.width || 300,
        height: item.height || Math.floor(Math.random() * 200) + 200,
        // 跨列设置
        columnSpan: shouldSpan ? (Math.random() < 0.7 ? 2 : 3) : 1,
        // 隐藏文字设置
        isHide: shouldHideText
      };
    });
    
    return { data: formattedData };
  } catch (error) {
    console.error('请求失败:', error);
    
    // 如果请求失败，返回mock数据
    const mockData = Array.from({ length: pageSize }, (_, index) => {
      const globalIndex = (page - 1) * pageSize + index;
      const shouldSpan = Math.random() < 0.15 && globalIndex % 7 === 0;
      const shouldHideText = Math.random() < 0.25;
      
      return {
        id: `mock-${globalIndex}`,
        title: `Mock标题 ${globalIndex + 1}`,
        content: `这是第${globalIndex + 1}个mock内容`,
        description: `这是第${globalIndex + 1}个mock描述`,
        image: `https://picsum.photos/${300 + Math.floor(Math.random() * 200)}/${200 + Math.floor(Math.random() * 300)}?random=${globalIndex}`,
        userName: `用户${globalIndex + 1}`,
        userId: `user-${globalIndex}`,
        width: 300 + Math.floor(Math.random() * 100),
        height: 200 + Math.floor(Math.random() * 300),
        columnSpan: shouldSpan ? (Math.random() < 0.7 ? 2 : 3) : 1,
        isHide: shouldHideText
      };
    });
    
    return { data: mockData };
  }
};

const handleError = (error: Error) => {
  console.error('加载出错:', error)
  // 显示错误提示
}

onMounted(() => {
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})
</script>

<style lang="stylus" scoped>
.article-list-page {
  min-height: 100vh;
  background: #fff;
  padding: 20px 0;
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 1000;
  
  p {
    margin: 0;
    line-height: 1.4;
  }
}

@media (max-width: 768px) {
  .article-list-page {
    padding: 16px 0;
  }
  
  .debug-info {
    top: 5px;
    right: 5px;
    font-size: 10px;
  }
}
</style>