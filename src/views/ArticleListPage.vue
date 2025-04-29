<template>
  <MasonryList
    :fetch-data="fetchArticles"
    :columnGap="12"
    :column-count="columnCount"
    :page-size="5"
    :gutter="16"
    @error="handleError"
  >
    <template #item="{ item }">
      <div class="custom-content">
        <img v-if="item.cover" :src="item.cover" />
        <div class="details">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </template>
  </MasonryList>

    <!-- <MasonryGrid
    :fetchData="fetchArticles"
    :columnCount="5"
    :pageSize="10"
  >
    <template #card="{ item }">
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <img :src="item.image" style="width: 100%; display: block;" />
        <div style="padding: 8px;">
          <h4 style="margin: 0;">{{ item.title }}</h4>
        </div>
      </div>
    </template>

    <template #skeleton>
      <div style="background: #eee; width: 100%; height: 100%; border-radius: 8px;"></div>
    </template>
  </MasonryGrid> -->
</template>

<script setup lang="ts">
import MasonryList from '@/components/MasonryList.vue'
import MasonryGrid from '@/bk/MasonryGrid.vue'
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import request from '@/utils/request'

const columnCount = ref(7)
const fetchArticles = async (page: number, pageSize: number) => {
  try {
    const response = await request.get(
      `/articles?page=${page}&pageSize=${pageSize}`
    );
    console.log(response)
    const {data} = response;
    return { data: data.data.list };
  } catch (error) {
    console.error('请求失败:', error);
    return { data: [] };
  }
};

const handleError = (error: Error) => {
  console.error('加载出错:', error)
  // 显示错误提示
}
</script>