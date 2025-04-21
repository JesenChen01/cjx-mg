<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTitle } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 设置页面标题
useTitle(t('page.source.title'));

// 数据
const loading = ref(false);
const sourceData = ref([]);

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    // 这里可以替换为实际的API调用
    // const { data } = await api.getSourceData();
    // sourceData.value = data;

    // 模拟数据
    sourceData.value = [
      { id: 1, name: '源码1', description: '这是源码1的描述', stars: 120 },
      { id: 2, name: '源码2', description: '这是源码2的描述', stars: 340 },
      { id: 3, name: '源码3', description: '这是源码3的描述', stars: 230 }
    ];
  } catch (error) {
    console.error('获取数据失败', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="source-container">
    <NSpace vertical :size="16">
      <NPageHeader :title="t('page.source.title')" />

      <NCard :bordered="false">
        <template #header>
          <div class="flex items-center justify-between">
            <span>{{ t('page.source.listTitle') }}</span>
            <NButton type="primary">
              {{ t('common.refresh') }}
            </NButton>
          </div>
        </template>

        <NSpin :show="loading">
          <NList hoverable clickable>
            <NListItem v-for="item in sourceData" :key="item.id">
              <NThing :title="item.name" :description="item.description">
                <template #avatar>
                  <NIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
                      />
                    </svg>
                  </NIcon>
                </template>
                <template #footer>
                  <div class="flex items-center">
                    <NIcon class="mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27z"
                        />
                      </svg>
                    </NIcon>
                    <span>{{ item.stars }}</span>
                  </div>
                </template>
              </NThing>
            </NListItem>
          </NList>
        </NSpin>
      </NCard>
    </NSpace>
  </div>
</template>

<style scoped>
.source-container {
  padding: 16px;
}
</style>
