/**
 * 检测网页整体是否处于暗色（dark）主题，它是响应式的
 * return { isDark, toggleDark }
 */

import { ref } from "vue";

const isDark = ref(false);

const toggleDark = () => {
  isDark.value = !isDark.value;
};

export function useDark() {
  return { isDark, toggleDark };
}
