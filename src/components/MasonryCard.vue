<template>
    <div class="pinterest-card"
         :class="{ 
             moving: !article.left && !article.top && index != 0,
             'span-multiple': article.columnSpan && article.columnSpan > 1
         }"
         :style="{
             transform: `translate(${article.left}px, ${article.top}px)`,
             width: `${getCardWidth()}px`
         }"
         @mouseenter="handleMouseEnter"
         @mouseleave="handleMouseLeave"
         @click="handleCardClick">
        
        <div class="card-container" :class="{ hovered: isHovered }">
            <!-- 图片容器 -->
            <div class="image-container"
                 :style="{
                     height: `${getImageHeight()}px`,
                     backgroundColor: !article.loaded ? bgColor : 'transparent',
                 }"
                 :class="{ skeleton: !loaded }">
                
                <img v-lazy="article.image" 
                     class="card-image" 
                     :class="{ loading: !loaded && !article.loaded }"
                     @load="handleImageLoad" 
                     @error="handleImageError" />
                
                <!-- 悬停时的遮罩层 -->
                <div class="hover-overlay" :class="{ visible: isHovered }">
                    <!-- 右上角保存按钮 -->
                    <div class="save-button" @click.stop="handleSave">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                                  fill="currentColor"/>
                        </svg>
                        保存
                    </div>
                    
                    <!-- 右上角更多选项 -->
                    <div class="more-options" @click.stop="handleMoreOptions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="5" r="2" fill="currentColor"/>
                            <circle cx="12" cy="12" r="2" fill="currentColor"/>
                            <circle cx="12" cy="19" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    
                    <!-- 左下角分享按钮 -->
                    <div class="share-button" @click.stop="handleShare">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92S20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" 
                                  fill="currentColor"/>
                        </svg>
                    </div>
                    
                    <!-- 右下角链接按钮 -->
                    <div class="link-button" @click.stop="handleLinkClick">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3M19 19H5V5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 19.1 20 19 19V12H17V19Z" 
                                  fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- 底部信息 - 只在不隐藏时显示 -->
            <div v-if="!article.isHide" class="card-info" :id="`bottom-info-${article.id}`">
                <div class="card-title">{{ article.title }}</div>
                <div class="user-info" v-if="article.userName">
                    <div class="user-avatar">
                        <div class="avatar-placeholder">{{ article.userName.charAt(0).toUpperCase() }}</div>
                    </div>
                    <div class="user-name" @click.stop="handleUserClick">{{ article.userName }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, onMounted, nextTick, defineExpose, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

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
    isShowBottom?: boolean,
    isHide?: boolean,
    columnSpan?: number  // 跨列数量
};

const props = defineProps<{
    article: Article
    columnWidth: number,
    columnGap: number,
    index: number
}>()

const router = useRouter()
const loaded = ref(false)
const isHovered = ref(false)

const emit = defineEmits<{
    (e: 'image-load', id: string, height: number): void
    (e: 'image-error', article: typeof props.article, height: number): void
    (e: 'click', link: string): void
    (e: 'height', article: Article, height: number): void;
}>()

const getEstimatedHeight = () => {
    const imageHeight = getImageHeight();
    
    // 如果隐藏文字，只返回图片高度
    if (props.article.isHide) {
        return imageHeight;
    }
    
    // 预估底部信息高度
    const estimatedBottomHeight = props.article.title ? 
        (props.article.userName ? 65 : 45) : // 有用户名时高度更大
        30; // 最小高度
    
    return imageHeight + estimatedBottomHeight;
};

const recalculate = () => {
    nextTick(() => {
        if (loaded.value) {
            // 图片已加载，使用实际高度
            const bottomHeight = props.article.isHide ? 0 : getBottomInfoHeight();
            const totalHeight = getImageHeight() + bottomHeight;
            emit('height', props.article, totalHeight);
        } else {
            // 图片未加载，使用预估高度
            const estimatedHeight = getEstimatedHeight();
            emit('height', props.article, estimatedHeight);
        }
    })
};

const handleImageLoad = (event: Event) => {
    loaded.value = true;
    
    // 图片加载完成后，重新计算精确高度
    nextTick(() => {
        const bottomHeight = props.article.isHide ? 0 : getBottomInfoHeight();
        const totalHeight = getImageHeight() + bottomHeight;
        emit('image-load', props.article.id, totalHeight);
    });
}

const handleImageError = () => {
    loaded.value = true;
    
    nextTick(() => {
        const bottomHeight = props.article.isHide ? 0 : getBottomInfoHeight();
        const totalHeight = getImageHeight() + bottomHeight;
        emit('image-error', props.article, totalHeight);
    });
}

const handleCardClick = () => {
    // 跳转到详情页
    router.push(`/pin/${props.article.id}`)
}

const handleMouseEnter = () => {
    isHovered.value = true
}

const handleMouseLeave = () => {
    isHovered.value = false
}

const handleSave = () => {
    console.log('保存图片:', props.article.id)
    // 这里可以添加保存逻辑
}

const handleMoreOptions = () => {
    console.log('更多选项:', props.article.id)
    // 这里可以添加更多选项的逻辑
}

const handleShare = () => {
    console.log('分享图片:', props.article.id)
    // 这里可以添加分享逻辑
}

const handleLinkClick = () => {
    console.log('访问链接:', props.article.id)
    // 这里可以添加访问原链接的逻辑
}

const handleUserClick = () => {
    if (props.article.userId) {
        router.push(`/user/${props.article.userId}`)
    }
}

const generateSoftColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 20%, 85%)`;
}

const getBottomInfoHeight = (): number => {
    const el = document.getElementById(`bottom-info-${props.article.id}`);
    if (!el) return 0;
    return el?.offsetHeight || 0;
};

onMounted(() => {
    // 初始化时使用预估高度，避免骨架图阶段的重叠问题
    const estimatedHeight = getEstimatedHeight();
    emit('height', props.article, estimatedHeight);
});

defineExpose({
    recalculate
});

const bgColor = generateSoftColor()

const getCardWidth = () => {
    if (props.article.columnSpan && props.article.columnSpan > 1) {
        // 跨列宽度 = 列数 × 列宽 + (列数-1) × 列间距
        const width = props.columnWidth * props.article.columnSpan + (props.article.columnSpan - 1) * props.columnGap;
        console.log(`跨列卡片宽度计算: ${props.article.columnSpan}列 × ${props.columnWidth}px + ${props.article.columnSpan - 1} × ${props.columnGap}px = ${width}px`);
        return width;
    }
    return props.columnWidth;
}

const getImageHeight = () => {
    return (props.article.height / props.article.width) * getCardWidth();
}

// 监听columnWidth变化，重新计算高度
watch(() => props.columnWidth, (newWidth, oldWidth) => {
    if (newWidth !== oldWidth && newWidth > 0) {
        console.log('卡片列宽变化:', oldWidth, '->', newWidth);
        // 重新计算并发送高度
        nextTick(() => {
            const estimatedHeight = getEstimatedHeight();
            emit('height', props.article, estimatedHeight);
        });
    }
});
</script>

<style lang="stylus" scoped>
.pinterest-card {
    position: absolute;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    will-change: transform;
    cursor: pointer;
    
    &.moving {
        display: none;
    }
}

.card-container {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    &.hovered {
        transform: translateY(-8px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
}

.image-container {
    position: relative;
    overflow: hidden;
    border-radius: 16px 16px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.5s ease, filter 0.5s ease, transform 0.2s ease;
    
    &.loading {
        opacity: 0.3;
        filter: blur(5px);
        height: 100%;
    }
}

.hovered .card-image {
    transform: scale(1.05);
}

.hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s ease;
    
    &.visible {
        opacity: 1;
    }
}

.save-button {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #e60023;
    color: white;
    padding: 8px 16px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    
    &:hover {
        background: #ad081b;
        transform: scale(1.05);
    }
}

.more-options {
    position: absolute;
    top: 12px;
    right: 120px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
    }
}

.share-button {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
    }
}

.link-button {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.1);
    }
}

.card-info {
    padding: 12px;
}

.card-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #666;
}

.user-name {
    font-size: 12px;
    color: #767676;
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
        color: #333;
        text-decoration: underline;
    }
}

.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 16px;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    z-index: 1;
    
    /* 确保骨架图有最小高度 */
    min-height: 200px;
}

@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* 骨架图状态下的卡片信息预留空间 */
.skeleton + .card-info {
    min-height: 45px;
    background: #f5f5f5;
    border-radius: 0 0 16px 16px;
}

.card-image.loading {
    opacity: 0;
    height: 100%;
    /* 确保图片容器在加载时保持高度 */
    min-height: inherit;
}
</style>