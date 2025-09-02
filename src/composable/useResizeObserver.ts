/**
 * 监听元素尺寸的变化，内置自定义防抖时长，支持ID和类选择器
 * params
 * target:string | ElementRef<HTMLDivElement> | string[] | ElementRef<HTMLDivElement>[] 监听哪个容器元素，可以是类名（'.class'）、ID（'.id'），也可以是 ref
 * callback: ResizeObserverCallback 容器尺寸变化后的回调函数，返回一个entries数组对象，对象为监听容器元素的宽高等属性值
 * options?: {
 *   time: number 防抖延迟时间，单位：毫秒
 *   immediate: boolean 初始化时是否立刻触发回调
 *   box: string 拥有三个可选项。content-box（默认）指的是元素的内容区域尺寸，不包括边框和内边距；border-box指的是元素的边框盒尺寸，包括内容、内边距和边框，但不包括外边距；device-pixel-content-box指的是设备像素级别观察尺寸变化
 * }
 * return { stop, restart }
 */

import type { Ref } from "vue";
import { unref, nextTick } from "vue";

export type ResizeTarget =
  | string // '.class' / '#id'
  | Ref<HTMLElement | null> // ref
  | Array<string | Ref<HTMLElement | null>>;

export interface ResizeOptions {
  time?: number; // 防抖毫秒，默认 16
  immediate?: boolean; // 初始立即触发，默认 false
  box?: "content-box" | "border-box" | "device-pixel-content-box";
}

export type ResizeObserverCallback = (
  entries: ResizeObserverEntry[] | ResizeCallbackPayload[]
) => void;

export type ResizeCallbackPayload = Pick<
  ResizeObserverEntry,
  "target" | "contentRect"
>;

export function useResizeObserver(
  target: ResizeTarget,
  callback: ResizeObserverCallback,
  options: ResizeOptions = {}
) {
  const { time = 16, immediate = false, box = "content-box" } = options;

  let observer: ResizeObserver | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  /* 防抖包装 */
  const debouncedCallback = (
    entries: ResizeObserverEntry[] | ResizeCallbackPayload[]
  ) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => callback(entries), time);
  };

  /* 统一转成 HTMLElement[] */
  function resolveElements(): HTMLElement[] {
    const list = Array.isArray(target) ? target : [target];
    return list
      .map(t => {
        if (typeof t === "string") {
          return Array.from(document.querySelectorAll<HTMLElement>(t));
        }
        const el = unref(t);
        return el ? [el] : [];
      })
      .flat()
      .filter(Boolean) as HTMLElement[];
  }

  /* 开始监听 */
  function start() {
    stop(); // 先清理旧实例
    const els = resolveElements();
    if (!els.length) return;

    observer = new ResizeObserver(debouncedCallback);
    els.forEach(el => observer!.observe(el, { box }));
    if (immediate) {
      nextTick(() => {
        const payload: ResizeCallbackPayload[] = els.map(el => ({
          target: el,
          contentRect: el.getBoundingClientRect()
        }));
        debouncedCallback(payload);
      });
    }
  }

  /* 停止监听 */
  function stop() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  start(); // 立即生效

  return { stop, restart: start };
}
