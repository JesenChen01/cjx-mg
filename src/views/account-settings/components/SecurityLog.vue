<script setup lang="ts">
import dayjs from "dayjs";
import { getMineLogs } from "@/api/user";
import { reactive, ref, onMounted } from "vue";
import { deviceDetection } from "@/utils/util";

defineOptions({
  name: "SecurityLog"
});

const loading = ref(true);
const dataList = ref([]);

async function onSearch() {
  loading.value = true;
  const { data } = await getMineLogs();
  dataList.value = data.list;

  setTimeout(() => {
    loading.value = false;
  }, 200);
}

onMounted(() => {
  onSearch();
});
</script>

<template>
  <div
    :class="[
      'min-w-[180px]',
      deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]'
    ]"
  >
    <h3 class="my-8!">安全日志</h3>
  </div>
</template>
