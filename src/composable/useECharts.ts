/**
 * 兼容 echarts 所有 api 并且额外添加尺寸自适应容器和自动销毁等功能，echarts 能实现的它都行
 */

import { ref, onUnmounted, nextTick, type Ref, type ComputedRef } from "vue";
import * as echarts from "echarts/core";
import type { EChartsOption, SetOptionOpts } from "echarts";
import { useResizeObserver } from "./useResizeObserver";

export interface EChartsOptions {
  /** 是否自动调整尺寸，默认 true */
  autoResize?: boolean;
  /** 是否在组件卸载时自动销毁，默认 true */
  autoDispose?: boolean;
  /** 初始化配置 */
  initOptions?: {
    width?: number | string;
    height?: number | string;
    renderer?: "canvas" | "svg";
    useDirtyRect?: boolean;
  };
  /** 设置配置项时的选项 */
  setOptionOpts?: SetOptionOpts;
  /** 图表主题 */
  theme?: ComputedRef<"light" | "dark">;
}

export function useECharts(
  container: Ref<HTMLElement | null> | HTMLElement,
  options: EChartsOptions = {}
) {
  const {
    autoResize = true,
    autoDispose = true,
    initOptions = {},
    setOptionOpts = { notMerge: false }
  } = options;

  const chartInstance = ref<any>(null);
  const isReady = ref(false);

  // 初始化图表
  const initChart = async () => {
    await nextTick();
    const el =
      typeof container === "object" && "value" in container
        ? container.value
        : container;

    if (!el) {
      console.warn("ECharts container element not found");
      return;
    }

    if (chartInstance.value) {
      chartInstance.value.dispose();
    }

    chartInstance.value = echarts.init(el, initOptions);
    isReady.value = true;

    // 自动调整尺寸
    if (autoResize) {
      const { stop } = useResizeObserver(el as any, () => {
        chartInstance.value?.resize();
      });

      if (autoDispose) {
        onUnmounted(stop);
      }
    }
  };

  // 设置配置项
  const setOption = (option: EChartsOption, opts?: SetOptionOpts) => {
    if (!chartInstance.value) {
      console.warn("ECharts instance not initialized");
      return;
    }
    chartInstance.value.setOption(option, opts || setOptionOpts);
  };

  // 获取图表实例
  const getInstance = () => chartInstance.value;

  // 调整尺寸
  const resize = () => {
    chartInstance.value?.resize();
  };

  // 显示加载动画
  const showLoading = (opts?: any) => {
    chartInstance.value?.showLoading(opts);
  };

  // 隐藏加载动画
  const hideLoading = () => {
    chartInstance.value?.hideLoading();
  };

  // 销毁图表
  const dispose = () => {
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
      isReady.value = false;
    }
  };

  // 自动销毁
  if (autoDispose) {
    onUnmounted(dispose);
  }

  return {
    chartInstance,
    isReady,
    initChart,
    setOption,
    setOptions: setOption, // 兼容旧用法
    getInstance,
    resize,
    showLoading,
    hideLoading,
    dispose
  };
}
