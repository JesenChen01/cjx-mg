/**
 * 获取已经注册的全局属性对象 globalProperties
 * */
import { getCurrentInstance } from "vue";

export function useGlobal() {
  const globalProperties =
    getCurrentInstance()?.appContext.config.globalProperties;
  return globalProperties;
}
