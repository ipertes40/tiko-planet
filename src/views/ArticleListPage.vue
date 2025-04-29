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