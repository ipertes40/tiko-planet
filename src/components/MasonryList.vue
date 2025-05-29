<template>
  <div class="pinterest-masonry" ref="container">
    <!-- <ul v-infinite-scroll="loadNextPage" class="infinite-list"> -->
    <div class="masonry-container" :style="{ height: `${listHeight}px` }">
      <MasonryCard v-for="(article, index) in articles" :key="article.id" :article="article" :columnWidth="columnWidth" :columnGap="columnGap" :index="index"
        ref="cardRefs" @image-load="onImageLoad" @image-error="onImageError" @click="handleClick"
        @height="onHeightReported" />
    </div>
    <!-- </ul> -->
    <div ref="trigger" class="load-trigger">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="noMore" class="no-more">
        <span>已经到底了</span>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';
import type { PropType } from 'vue';
import MasonryCard from './MasonryCard.vue';
import debounce from 'lodash/debounce';

type Article = {
  id: string;
  image: string;
  title: string;
  content: string;
  width: number;
  height: number;
  left?: number;
  top?: number;
  loaded?: boolean;
  skeleton?: boolean,
  imageError?: boolean,
  userName?: string,
  userId?: string,
  description?: string,
  realHeight?: number,
  isHide?: boolean,
  columnSpan?: number
};

const CARD_BOTTOM_PADDING = 45; // 卡片底部信息区域高度

type FetchFunction = (page: number, pageSize: number) => Promise<{ data: Article[] }>;

interface Props {
  columnCount?: number;
  columnGap?: number;
  rowGap?: number;
  fetchData: FetchFunction;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  columnCount: 5,
  columnGap: 16,
  rowGap: 16,
  pageSize: 10
});

const container = ref<HTMLElement>();
const trigger = ref<HTMLElement>();
const articles = ref<Article[]>([]);
const loading = ref(false);
const noMore = ref(false);
const currentPage = ref(1);
const columnWidth = ref(0);
const columnsHeight = ref<number[]>([]);
const listHeight = ref(0);
let observer: IntersectionObserver | null = null;
const cardRefs = ref<any[]>([]);

// 计算属性：获取列间距
const columnGap = computed(() => props.columnGap);

const handleClick = () => {
  // 点击处理已在MasonryCard中实现
}

const onHeightReported = (article: Article, height: number) => {
  const updated = calculateItemPosition(article, height)
  const index = articles.value.findIndex(a => a.id === article.id)
  if (index > -1) {
    articles.value.splice(index, 1, { ...updated, realHeight: height })
  }
};

const debouncedLoadNextPage = debounce(() => {
  if (!loading.value && !noMore.value) {
    loadNextPage();
  }
}, 300);

const debouncedRecalculateLayout = debounce(() => {
  recalculateLayout();
}, 100);

const onImageLoad = (articleId: string, height: number) => {
  // 图片加载完成后，防抖重新计算布局
  const article = articles.value.find(a => a.id === articleId);
  if (article) {
    article.realHeight = height;
    debouncedRecalculateLayout();
  }
}

const onImageError = (article: Article, height: number) => {
  // 图片加载错误时也需要重新计算
  const foundArticle = articles.value.find(a => a.id === article.id);
  if (foundArticle) {
    foundArticle.realHeight = height;
    debouncedRecalculateLayout();
  }
}

const recalculateLayout = () => {
  // 重置列高度
  columnsHeight.value = new Array(props.columnCount).fill(0);
  
  // 重新计算所有已加载项目的位置
  const updatedArticles = articles.value.map(article => {
    if (article.realHeight) {
      return calculateItemPosition(article, article.realHeight);
    } else {
      // 使用预估高度
      const columnSpan = article.columnSpan || 1;
      const itemWidth = columnSpan > 1 
        ? columnWidth.value * columnSpan + (columnSpan - 1) * props.columnGap
        : columnWidth.value;
      const imageHeight = (article.height / article.width) * itemWidth;
      const estimatedBottomHeight = article.isHide ? 0 : 
        (article.title ? (article.userName ? 65 : 45) : 30);
      const estimatedHeight = imageHeight + estimatedBottomHeight;
      return calculateItemPosition(article, estimatedHeight);
    }
  });
  
  articles.value = updatedArticles;
};

const calculateLayoutParameters = () => {
  if (!container.value) return;
  const containerWidth = container.value.offsetWidth;
  
  // 计算列宽，确保有足够的间距
  columnWidth.value = Math.floor((containerWidth - (props.columnCount - 1) * props.columnGap) / props.columnCount);
  columnsHeight.value = new Array(props.columnCount).fill(0);
  
  console.log('布局参数:', {
    containerWidth,
    columnWidth: columnWidth.value,
    columnCount: props.columnCount,
    columnGap: props.columnGap
  });
};

// 计算每个item的位置
const calculateItemPosition = (item: Article, height: number) => {
  const columnSpan = item.columnSpan || 1;
  
  // 对于跨列项目，需要找到连续的空间
  let columnIndex = 0;
  if (columnSpan > 1) {
    let bestPosition = 0;
    let minMaxHeight = Infinity;
    
    // 找到可以容纳跨列项目的最佳位置
    for (let i = 0; i <= props.columnCount - columnSpan; i++) {
      // 检查从第i列开始的连续columnSpan列的最大高度
      let maxHeight = 0;
      for (let j = i; j < i + columnSpan; j++) {
        maxHeight = Math.max(maxHeight, columnsHeight.value[j]);
      }
      
      // 选择最大高度最小的位置（即最靠上的位置）
      if (maxHeight < minMaxHeight) {
        minMaxHeight = maxHeight;
        bestPosition = i;
      }
    }
    
    columnIndex = bestPosition;
    console.log(`跨列项目${item.id}: 占${columnSpan}列, 最佳位置第${columnIndex}列, 最大高度=${minMaxHeight}px`);
  } else {
    // 单列项目，找最短的列
    const minHeight = Math.min(...columnsHeight.value);
    columnIndex = columnsHeight.value.indexOf(minHeight);
  }
  
  // 计算位置
  const left = columnIndex * (columnWidth.value + props.columnGap);
  const top = columnSpan > 1 
    ? Math.max(...columnsHeight.value.slice(columnIndex, columnIndex + columnSpan))
    : columnsHeight.value[columnIndex];
  
  const finalTop = top + (top > 0 ? props.rowGap : 0);
  
  // 计算实际宽度和高度
  const itemWidth = columnSpan > 1 
    ? columnWidth.value * columnSpan + (columnSpan - 1) * props.columnGap
    : columnWidth.value;
  
  const imageHeight = (item.height / item.width) * itemWidth;
  const bottomHeight = item.isHide ? 0 : 45; // 底部信息高度
  const totalHeight = height || (imageHeight + bottomHeight);
  
  console.log(`布局计算 - 项目${item.id}: ${columnSpan}列, 位置第${columnIndex}列, 宽度=${itemWidth}px, 高度=${totalHeight}px`);
  
  // 更新受影响的列高度
  for (let i = columnIndex; i < columnIndex + columnSpan; i++) {
    columnsHeight.value[i] = finalTop + totalHeight;
  }
  
  listHeight.value = Math.max(...columnsHeight.value);
  
  return { ...item, left, top: finalTop };
}

const loadNextPage = async () => {
  if (loading.value || noMore.value) return;
  
  try {
    loading.value = true;
    const { data } = await props.fetchData(currentPage.value, props.pageSize);

    if (data.length === 0) {
      noMore.value = true;
      return;
    }

    if (columnWidth.value === 0) {
      calculateLayoutParameters();
    }

    const newArticles: Article[] = data.map(item => ({
      ...item,
      loaded: false
    }));

    articles.value.push(...newArticles);
    currentPage.value++;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const setupObserver = () => {
  if (observer) observer.disconnect();
  
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        debouncedLoadNextPage();
      }
    });
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0.1
  });

  if (trigger.value) {
    observer.observe(trigger.value);
  }
};

const previousWidth = ref(-1);
const widthChangeThreshold = 10; // 增加阈值，减少不必要的重新计算

const debouncedResizeHandler = debounce((entries: ResizeObserverEntry[]) => {
  entries.forEach(entry => {
    const currentWidth = entry.contentRect.width;

    if (previousWidth.value !== -1 && Math.abs(currentWidth - previousWidth.value) > widthChangeThreshold) {
      console.log('容器宽度变化，重新计算布局');
      calculateLayoutParameters();
      
      // 重新计算所有卡片位置
      nextTick(() => {
        cardRefs.value.forEach(card => {
          card?.recalculate?.();
        });
      });
    }
    previousWidth.value = currentWidth;
  });
}, 150);

const resizeObserver = new ResizeObserver(entries => {
  debouncedResizeHandler(entries);
});

watch(articles, (val) => {
  nextTick(() => {
    cardRefs.value = [...cardRefs.value];
  });
}, { deep: true });

watch(() => props.columnCount, (newCount, oldCount) => {
  console.log('列数变化:', oldCount, '->', newCount);
  if (newCount !== oldCount && container.value) {
    // 重新计算布局参数
    calculateLayoutParameters();
    
    // 如果有现有文章，重新计算它们的位置
    if (articles.value.length > 0) {
      nextTick(() => {
        recalculateLayout();
        
        // 强制所有卡片重新计算
        cardRefs.value.forEach(card => {
          card?.recalculate?.();
        });
      });
    }
  }
});

onMounted(() => {
  if (container.value) {
    resizeObserver.observe(container.value);
  }
  setupObserver();
  calculateLayoutParameters();
  loadNextPage();
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
  observer?.disconnect();
  debouncedResizeHandler.cancel();
  debouncedLoadNextPage.cancel();
  debouncedRecalculateLayout.cancel();
});
</script>

<style lang="stylus" scoped>
.pinterest-masonry {
  width: 100%;
  margin: 0 auto;
}

.masonry-container {
  position: relative;
  width: 100%;
  transition: height 0.3s ease;
}

.load-trigger {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #767676;
  font-size: 14px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e1e1e1;
  border-top: 2px solid #e60023;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-more {
  color: #767676;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .pinterest-masonry {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .pinterest-masonry {
    padding: 0 12px;
  }
}
</style>