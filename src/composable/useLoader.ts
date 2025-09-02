/**
 * 动态地将静态资源（CSS样式表或JavaScript脚本）加载到网页中
 */

import { ref } from "vue";

export function useLoader() {
  const loading = ref(false);
  const load = (url: string) => {
    loading.value = true;
    const script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
    script.onload = () => {
      loading.value = false;
    };
  };
  return { loading, load };
}
