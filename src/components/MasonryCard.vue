<template>
    <!-- skeleton-box -->
    <div class="article-item"   :class="{ moving: !article.left && !article.top && index != 0}"
    :style="{
        transform: `translate(${article.left}px, ${article.top}px)`,
        width: `${columnWidth}px`
    }">
        <div :style="{
            height: `${(article.height / article.width) * columnWidth}px`, backgroundColor: !article.loaded ? bgColor : 'transparent',
        }" class="article-wrapper"
         :class="{ skeleton: !loaded }">
            <img v-lazy="article.image" class="article-image" :class="{ loading: !loaded && !article.loaded }"
                @load="handleImageLoad" @error="handleImageError" />
            <!-- 蒙层 -->
            <div class="overlay text-content" @click="handleClick">
                <span>{{ article.id }}</span>
            </div>
        </div>
        <div class="bottom-info" :id="`bottom-info-${article.id}`" v-if=" true || article.isShowBottom">
            <div class="left-part">
                <div class="title">{{ article.title }}</div>
                <div class="user-name">{{ article.userName }}</div>
            </div>
            <div class="right-part"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, onMounted, nextTick, defineExpose, ref } from 'vue'
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
    isShowBottom?: boolean
};
const props = defineProps<{
    article: {
        id: string
        image: string
        title: string
        content: string
        width: number
        height: number
        left?: number
        top?: number
        loaded?: boolean
        skeleton?: boolean
        imageError?: boolean
        userName?: string
        userId?: string
        isShowBottom?:boolean
    }
    columnWidth: number,
    index: number
}>()

const loaded = ref(false)

const emit = defineEmits<{
    (e: 'image-load', id: string, height: number): void
    (e: 'image-error', article: typeof props.article, height: number): void
    (e: 'click', link: string): void
    (e: 'height', article: Article, height: number): void;
}>()
const recalculate = () => {
  nextTick(()=>{
    const height = getBottomInfoHeight();
    emit('height', props.article, height + (props.article.height / props.article.width) * props.columnWidth);
  })
};
//   成功 传入最后的高度
const handleImageLoad = (event: Event) => {
    // 本地改掉
    loaded.value = true 
    emit('image-load', props.article, getBottomInfoHeight())
}

const handleImageError = () => {
    emit('image-error', props.article, getBottomInfoHeight())
}

const handleClick = () => {
    emit('click', props.article.id)
}

const handleGetHeight = () => {
    emit('height', props.article, getBottomInfoHeight())
}

const generateSoftColor = () => {
    const hue = Math.floor(Math.random() * 360); // 任意色相
    return `hsl(${hue}, 20%, 85%)`; // 低饱和度、高亮度
}
// 获取下方info高度
const getBottomInfoHeight = (): number => {
    const el = document.getElementById(`bottom-info-${props.article.id}`);
    console.log(el?.offsetHeight)
    if (!el) return 0;
    return el?.offsetHeight || 0;
};


onMounted(() => {
    const height = getBottomInfoHeight()// 暂时弃用 这样会有样式问题
    emit('height', props.article, height + (props.article.height / props.article.width) * props.columnWidth);
});
defineExpose({
  recalculate
});
const bgColor = generateSoftColor()

</script>

<style lang="stylus" scoped>
.article-item {
    position: absolute;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
    &.moving{
        display: none
    }
}

.article-wrapper {
    overflow: hidden
    position: relative;
    border-radius: 12px 12px 0 0;
    overflow: hidden
}

.article-image {
    display: block;
    width: 100%;
    height: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #eee;
    transition: opacity 0.5s ease, filter 0.5s ease;
}

.article-image.loading {
    opacity: 0.3;
    filter: blur(5px);
    height: 100%;
}

.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
    color: white;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
.skeleton {
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

.bottom-info{
  display: flex
  width: 100%;        /* 明确父元素宽度（或限制最大宽度） */

  &:hover{
    cursor: pointer
  }
  padding: 5px
  .title{
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    white-space: nowrap;       /* 不换行 */
  overflow: hidden;          /* 隐藏超出部分 */
  text-overflow: ellipsis;   /* 超出部分显示... */
  }
  .user-name{
    font-size: 11px;
    // font-weight: 700;
    text-align: left
    &:hover{
      text-decoration: underline;
    }
  }
  .left-part{
    min-width: 0;      /* 关键点：防止子项撑开 flex 容器 */

    flex:1
  }
  .right-part{
    min-width: 30px
    width: 30px
    flex-shrink: 0;
  }
}
</style>