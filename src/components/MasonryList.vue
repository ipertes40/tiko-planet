<template>
  <div class="home-container" ref="container">
    <ul v-infinite-scroll="loadNextPage" class="infinite-list">
      <div class="list-container" :style="{ height: `${listHeight}px` }">
        <div v-for="(article, index) in articles" :key="article.id" class="article-item" :style="{
          transform: `translate(${article.left}px, ${article.top}px)`,
          width: `${columnWidth}px`
        }">
          <div :id="article.id" v-if="article.skeleton" class="skeleton-box"
            :style="{ height: `${article.height / article.width * columnWidth}px` }">
          </div>
          <template v-else>
            <div :style="{ height: `${(article.height / article.width) * columnWidth}px` }" class="article-wrapper">
              <img v-lazy="article.image" :alt="article.title" class="article-image"
                :class="{ loading: !article.loaded, error: article.imageError }" @load="onImageLoad(article.id, $event)"
                @error="onImageError(article)" />
              <!-- 蒙层 -->
              <div class="overlay text-content" @click="handleClick(article.link)">
                <span>{{ article.title }}</span> <!-- 这里可以是自定义内容，比如标题 -->
              </div>
            </div>
          </template>
        </div>
      </div>
    </ul>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { PropType } from 'vue';

// 懒加载指令
const lazyLoadDirective = {
  mounted(el: HTMLImageElement, binding: any) {
    // 对每个el进行监控操作，当到达上方200px的时候加载
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value;
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(el);
  }
};

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
  preload?: boolean
};

type FetchFunction = (page: number, pageSize: number) => Promise<{ data: Article[] }>;

export default defineComponent({
  name: 'MasonryList',
  directives: {
    lazy: lazyLoadDirective
  },
  props: {
    columnCount: {
      type: Number,
      default: 5
    },
    columnGap: {
      type: Number,
      default: 20
    },rowGap: {
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

    const onImageLoad = (id: string, event: Event) => {
      const imgElement = event.target as HTMLImageElement;
      const article = articles.value.find(a => a.id === id);

      console.log('onImageSuccess--->', article.id)
      console.log('onImageSuccess--->', article.title)

      if (article) {
        article.loaded = true;
        article.skeleton = false
        // 计算正确的高度
        const updatedItem = calculateItemPosition({
          ...article
        });

        // 更新数组
        const index = articles.value.findIndex(a => a.id === id);
        if (index > -1) {
          articles.value.splice(index, 1, updatedItem);
        }
        resetLayout();
      }
    };

    const calculateLayoutParameters = () => {
      if (!container.value) return;
      const containerWidth = container.value.offsetWidth;
      columnWidth.value = (containerWidth - (props.columnCount - 1) * props.columnGap) / props.columnCount;
      columnsHeight.value = new Array(props.columnCount).fill(0);
    };

    const calculateItemPosition = (item: Article) => {
      const minHeight = Math.min(...columnsHeight.value);
      const columnIndex = columnsHeight.value.indexOf(minHeight);

      const left = columnIndex * (columnWidth.value + props.columnGap);
      const top = minHeight + (columnsHeight.value[columnIndex] > 0 ? props.rowGap : 0);

      const newHeight = (item.height / item.width) * columnWidth.value;
      columnsHeight.value[columnIndex] = top + newHeight;

      // 更新容器整体高度（最大高度）
      listHeight.value = Math.max(...columnsHeight.value);

      return { ...item, left, top };
    };

    const onImageError = (item) => {
      // console.log('error ---> id ', item.id)
      console.log('onImageError--->', item.id)
      item.imageError = true; // 失败了就隐藏图片
      item.skeleton = false

      // 如果图片加载失败，可以尝试重新设置一个默认高度（可选）
      const updatedItem = calculateItemPosition({ ...item });
      const index = articles.value.findIndex(a => a.id === item.id);
      if (index > -1) {
        articles.value.splice(index, 1, updatedItem);
      }
      resetLayout()
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
        const newArticles: Article[] = [];

data.forEach(item => {
  const layout = calculateItemPosition(item); // 直接计算位置
  newArticles.push({
    ...item,
    ...layout,
    skeleton: false,
    loaded: false
  });
});

articles.value.push(...newArticles);
currentPage.value++;
        // const getPositions = (item) => {
        //   const minHeight = Math.min(...columnsHeight.value);
        //   const columnIndex = columnsHeight.value.indexOf(minHeight);

        //   const left = columnIndex * (columnWidth.value + props.columnGap);
        //   const top = minHeight + (columnsHeight.value[columnIndex] > 0 ? props.columnGap : 0);

        //   // 提前更新列高度（为骨架图预留空间）
        //   const skeletonHeight = (item.height / item.width) * columnWidth.value;
        //   columnsHeight.value[columnIndex] = top + skeletonHeight;

        //   return { left, top };
        // }

        // // 更新容器整体高度
        // listHeight.value = Math.max(...columnsHeight.value);
        // const gridMap = [] as any
        // // 2. 创建带有正确位置的骨架图
        // data.forEach((item, index) => {
        //   console.log('add1 ')
        //   const layout = getPositions(item)
        //   gridMap[index] = layout

        //   const skeletonItem = {
        //     ...item,
        //     id: `skeleton-${item.id}`,
        //     skeleton: true,
        //     left: layout.left,  // 直接设置正确位置
        //     top: layout.top
        //   }
        //   articles.value.push(skeletonItem);
        // }

        // );


        // const preloadTasks = data.map((item, index) => {
        //   const positionedItem = {
        //     ...item,
        //     left: gridMap[index].left,
        //     top: gridMap[index].top,
        //     // skeleton: true, 加上之后就不调用img了... 这样的话img的加载也就没了。
        //     preload: false
        //   };

        //   const skeletonIndex = articles.value.findIndex(a => a.id === `skeleton-${item.id}`);
        //   if (skeletonIndex > -1) {
        //     articles.value.splice(skeletonIndex, 1, positionedItem);
        //   }
        //   return positionedItem;
        // });
        // await Promise.all(preloadTasks);
        // currentPage.value++;
      } finally {
        loading.value = false;
      }
    };

    // 新增：重新计算所有列的高度
    const recalculateColumnsHeight = () => {
      columnsHeight.value = new Array(props.columnCount).fill(0);

      articles.value.forEach(item => {
        if (!item.skeleton) { // 只计算实际内容项
          const columnIndex = Math.round(item.left! / (columnWidth.value + props.columnGap));
          const itemBottom = item.top! + item.height!;

          if (itemBottom > columnsHeight.value[columnIndex]) {
            columnsHeight.value[columnIndex] = itemBottom;
          }
        }
      });

      listHeight.value = Math.max(...columnsHeight.value);
    };

    const setupObserver = () => {
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loading.value && !noMore.value) {
            loadNextPage();
          }
        });
      }, {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      });

      if (trigger.value) {
        observer.observe(trigger.value);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      calculateLayoutParameters();
      columnsHeight.value = new Array(props.columnCount).fill(0);
      articles.value = articles.value.map(item => {
        return calculateItemPosition({ ...item },)
      });
    });

    const resetLayout = () => {
      columnsHeight.value = new Array(props.columnCount).fill(0);
      articles.value = articles.value.map(item => calculateItemPosition(item));
    };

    onMounted(() => {
      if (container.value) {
        resizeObserver.observe(container.value);
      }
      if (trigger.value) {
        setupObserver();
      }
      nextTick(calculateLayoutParameters);
      loadNextPage();
    });

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
      observer?.disconnect();
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
      loadNextPage
    };
  }
});
</script>

<style scoped>
.home-container {
  position: relative;
  margin: 0 auto;
  width: 100%;
  /* max-width: 1200px; */
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

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  border-radius: 0 0 8px 8px;
}
</style>