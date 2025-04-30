<template>
    <div class="home-container" ref="container">
      <!-- <ul v-infinite-scroll="loadNextPage" class="infinite-list"> -->
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
              <div class="bottom-info" :id="`bottom-info-${article.id}`">
                <div class="title">{{ article.title }}</div>
                <div class="user-name"></div>
              </div>
            </template>
          </div>
        </div>
      <!-- </ul> -->
    </div>
  </template>
  
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import type { PropType } from 'vue';
  
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
    imageError?: boolean
  };
  
  type FetchFunction = (page: number, pageSize: number) => Promise<{ data: Article[] }>;
  
  export default defineComponent({
    name: 'MasonryList',
    directives: {
      lazy: lazyLoadDirective
    },
    props: {
      title: {
        type: String,
        default: 5
      },
      info: {
        type: String,
        default: 20
      }, dataList: {
        type: Array,
        default: []
      }
    },
    setup(props) {
        const toPage = ()=> {

        }
  
      return {
        toPage,
      };
    }
  });
  </script>
  
<style scoped>

</style>