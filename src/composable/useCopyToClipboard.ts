/**
 * 文本拷贝
 */

import { ref } from "vue";

export function useCopyToClipboard() {
  const copied = ref(false);
  const update = (text: string) => {
    navigator.clipboard.writeText(text);
    copied.value = !copied.value;
  };
  return { copied, update };
}
