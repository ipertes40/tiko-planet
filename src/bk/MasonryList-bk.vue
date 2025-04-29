<template>
    <div class="home-container" :style="{ columnCount: columnCount, columnGap: columnGap + 'px' }">
        <!-- 文章列表 -->
        <div class="article" v-for="(article, index) in articles" :key="article.id" :class="['article-item', { 'loading': isLoading(index) }]">
            <div class="image-container">
                <img :src="article.image" alt="Article image" />
                <div class="overlay">
                    <h3>{{ article.title }}</h3>
                    <p>{{ article.content }}</p>
                </div>
            </div>
        </div>

        <!-- 加载状态 -->
        <slot name="loading" v-if="loading">
            <div class="loading">加载中...</div>
        </slot>

        <slot name="no-more" v-if="noMore">
            <div class="no-more">没有更多数据了</div>
        </slot>

        <div id="load-more-trigger"></div> <!-- 观察触发加载的元素 -->
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { PropType } from 'vue';

type FetchFunction = (page: number, pageSize: number) => Promise<{ data: any[] }>;

export default defineComponent({
    name: 'MasonryList',

    props: {
        columnCount: {
            type: Number,
            default: 4,
            validator: (value: number) => value > 0
        },
        columnGap: {
            type: Number,
            default: 20,
            validator: (value: number) => value >= 0
        },
        fetchData: {
            type: Function as PropType<FetchFunction>,
            required: true,
            validator: (fn: FetchFunction) => {
                return typeof fn === 'function' && fn.length >= 1
            }
        },
        threshold: {
            type: Number,
            default: 200
        },
        pageSize: {
            type: Number,
            default: 10
        }
    },

    setup(props) {
        const articles = ref<any[]>([]);
        const currentPage = ref(1);
        const loading = ref(false);
        const noMore = ref(false);
        const isLoadingState = ref<boolean[]>([]); // 跟踪每个条目的加载状态
        let observer: IntersectionObserver | null = null;

        const loadNextPage = async () => {
            try {
                loading.value = true;
                const { data } = await props.fetchData(currentPage.value, props.pageSize);

                if (data.length) {
                    articles.value.push(...data); // 追加数据，避免重新渲染
                    currentPage.value++;
                    noMore.value = data.length < props.pageSize;

                    // 记录加载状态
                    isLoadingState.value.push(...data.map(() => false));
                } else {
                    noMore.value = true;
                }
            } catch (error) {
                console.error('数据加载失败:', error);
            } finally {
                loading.value = false;
            }
        };

        // 监听滚动触发加载更多
        const setupObserver = () => {
            const target = document.querySelector('#load-more-trigger');
            if (target) {
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !loading.value && !noMore.value) {
                            loadNextPage();
                        }
                    });
                }, { rootMargin: '100px' });
                observer.observe(target);
            }
        };

        onMounted(() => {
            setupObserver();
            loadNextPage(); // 初始加载第一页
        });

        onBeforeUnmount(() => {
            if (observer) {
                observer.disconnect();
            }
        });

        // 判断每个项目是否正在加载
        const isLoading = (index: number) => {
            return isLoadingState.value[index];
        };

        return {
            articles,
            loading,
            noMore,
            isLoading,
        };
    }
});
</script>

<style scoped>
.home-container {
    column-gap: 20px;
    transition: column-count 0.3s ease;
}

.article {
    display: inline-block;
    width: 100%;
    break-inside: avoid;
    margin-bottom: 20px;
    background: transparent;
    position: relative;
}

.article-item {
    position: relative;
    transition: opacity 0.3s ease-in-out;
}

.article-item.loading {
    opacity: 0.5;
}

.image-container {
    position: relative;
    width: 100%;
    transition: transform 0.3s ease;
}

.image-container:hover {
    transform: translateY(-5px);
}

.article img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.article:hover .overlay {
    opacity: 1;
}

.loading,
.no-more {
    text-align: center;
    padding: 20px;
    color: #666;
    column-span: all;
}

.no-more {
    color: #999;
    font-size: 0.9em;
}

h3 {
    font-size: 1.2em;
    line-height: 1.3;
    margin-bottom: 8px;
}

p {
    font-size: 0.9em;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.9);
}
</style>
