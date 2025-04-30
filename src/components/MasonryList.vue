<template>
  <div class="home-container" ref="container">
    <!-- <ul v-infinite-scroll="loadNextPage" class="infinite-list"> -->
    <div class="list-container" :style="{ height: `${listHeight}px` }">
      <MasonryCard v-for="(article, index) in articles" :key="article.id" :article="article" :columnWidth="columnWidth" :index="index"
        ref="cardRefs" @image-load="onImageLoad" @image-error="onImageError" @click="handleClick"
        @height="onHeightReported" />
    </div>
    <!-- </ul> -->
    <div ref="trigger" class="observer-trigger">
      <span v-if="loading">加载中...</span>
      <span v-else-if="noMore">没有更多了</span>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import type { PropType } from 'vue';
// import Popover.vue from ''
import MasonryCard from '@/components/MasonryCard.vue';
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
  userId?: string
};

type FetchFunction = (page: number, pageSize: number) => Promise<{ data: Article[] }>;

export default defineComponent({
  name: 'MasonryList',
  components: {
    MasonryCard
  },
  props: {
    columnCount: {
      type: Number,
      default: 5
    },
    columnGap: {
      type: Number,
      default: 20
    }, rowGap: {
      type: Number,
      default: 20
    },
    fetchData: {
      type: Function as PropType<FetchFunction>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  setup(props) {
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

    const handleClick = () => {

    }

    const pendingHeights = new Map<number, number>();

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
    // 图片加载成功
    const onImageLoad = (article, height) => {
      
    }

    const onImageError = (item: Article, height: number) => {

    }

    const calculateLayoutParameters = () => {
      

      console.log('calculateLayoutParameters')
      if (!container.value) return;
      const containerWidth = container.value.offsetWidth;
      columnWidth.value = (containerWidth - (props.columnCount - 1) * props.columnGap) / props.columnCount;
      columnsHeight.value = new Array(props.columnCount).fill(0);
    };

    watch(columnsHeight,(val)=>{
      console.log('val===>',val)
    })

    // 计算每个item的位置 需要加上高度
    const calculateItemPosition = (item: Article, height: number) => {
      
      const minHeight = Math.min(...columnsHeight.value)
      const columnIndex = columnsHeight.value.indexOf(minHeight)
      const left = columnIndex * (columnWidth.value + props.columnGap)
      const top = minHeight + (columnsHeight.value[columnIndex] > 0 ? props.rowGap : 0)
      console.log("top=>", top)
      console.log("height=>", height)

      columnsHeight.value[columnIndex] = top + height
      listHeight.value = Math.max(...columnsHeight.value)
      return { ...item, left, top }
    }


    const loadNextPage = async () => {
      

      // 加载下一页之前要先拿到所有的高度压 怎么办
      if (loading.value || noMore.value) return;
      try {
        loading.value = true;
        const { data } = await props.fetchData(currentPage.value, props.pageSize);

        if (data.length === 0) {
          noMore.value = true;
          return;
        }

        if (columnWidth.value === 0) {
          console.log('columnWidth.value===>', columnWidth.value)
          calculateLayoutParameters();
        }
        const newArticles: Article[] = [];

        data.forEach(item => {
          // 高度如何获取
          newArticles.push({
            ...item,
            loaded: false
          });
        });
        articles.value.push(...newArticles);
        currentPage.value++;
      } finally {
        loading.value = false;
      }
    };

    const setupObserver = () => {
      

      if (observer) observer.disconnect();
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          console.log('debouncedLoadNextPage')
            debouncedLoadNextPage();
        });
      }, {
        root: null,
        rootMargin: '300px',
        threshold: 0.1
      });

      if (trigger.value) {
        observer.observe(trigger.value);
      }
    };

    const previousWidth = ref(-1) // 保存上一次宽度
    const widthChangeThreshold = 1 // 宽度变化超过1px才响应

    const debouncedResizeHandler = debounce((entries: ResizeObserverEntry[]) => {
      

      entries.forEach(entry => {
        // 获取当前实际宽度
        const currentWidth = entry.contentRect.width

        // 判断是否达到变化阈值
        if (previousWidth.value!= -1 && Math.abs(currentWidth - previousWidth.value) > widthChangeThreshold) {
          // alert('对对对')
          console.log('宽度变化触发',
            previousWidth.value, '→', currentWidth,
            '变化量:', currentWidth - previousWidth.value
          )

          calculateLayoutParameters()
          // nextTick(() => {
          //   cardRefs.value.forEach(card => {
          //     card?.recalculate?.()
          //   })
          // })
          cardRefs.value.forEach(card => {
              card?.recalculate?.()
            })
          // 更新记录值
          previousWidth.value = currentWidth
        } else {
          previousWidth.value = 0
        }
      })
    }, 100)

    // 创建观察器时使用带 entries 的回调
    const resizeObserver = new ResizeObserver(entries => {
      debouncedResizeHandler(entries)
    })

    const resetLayout = (changedItem?: Article) => {
      columnsHeight.value = new Array(props.columnCount).fill(0);
      articles.value = articles.value.map(item => calculateItemPosition(item, item.realHeight));
      // 保留现有列高
    };

    watch(articles, (val) => {
      nextTick(() => {
        cardRefs.value = [...cardRefs.value]; // 强制更新引用
      });
    },{ deep: true })

    onMounted(() => {
      if (container.value) {
        resizeObserver.observe(container.value);
      }
      if (trigger.value) {
        setupObserver();
      }
      // nextTick(calculateLayoutParameters);
      calculateLayoutParameters()
      debouncedLoadNextPage();
    });

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
      observer?.disconnect();

      debouncedResizeHandler.cancel(); // 使用 lodash 的 cancel 方法
    });

    return {
      container,
      trigger,
      articles,
      loading,
      noMore,
      columnWidth,
      listHeight,
      onImageLoad,
      onImageError,
      loadNextPage,
      handleClick,
      onHeightReported, cardRefs
    };
  }
});
</script>

<style lang="stylus" scoped>

.article-wrapper{
  position: relative
  border-radius: 16px
}
.home-container {
  // position: relative;
  margin: 0 auto;
  width: 100%;
  /* max-width: 1200px; */
  // display: flex
}

.list-container {
  position: relative;
  width: 100%;
  transition: height 0.3s ease;
}

.article-item {
  position: absolute;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.article-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #eee;
  transition: opacity 0.5s ease, filter 0.5s ease;
}

.article-image.loading {
  opacity: 0.3;
  filter: blur(5px);
}

.article-image:not(.loading) {
  opacity: 1;
  filter: none;
}

.overlay {
  height: 100%;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  padding: 1rem;
  transform: translateY(-50%);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  box-sizing: border-box;
  max-height: 100%;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
}

.observer-trigger {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9em;
  color: #666;
  // position: absolute
  // bottom: 0
}

.article-container {
  display: flex;
  flex-direction: column;
}

.article-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
}

.article-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.text-content {
  padding: 10px;
}

.infinite-list {
  width: 100%;
  padding: 0;
}

.skeleton-box {
  background: #f0f0f0;
  border-radius: 8px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  z-index: 1;
}

@keyframes skeleton-loading {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

</style>