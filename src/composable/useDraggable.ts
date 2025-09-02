/**
 * 使元素可拖动
 */

import { ref, onMounted, onUnmounted, type Ref } from "vue";

export interface DraggableOptions {
  /** 拖拽句柄选择器，默认整个元素可拖拽 */
  handle?: string;
  /** 是否限制在父容器内，默认 false */
  bounds?: boolean | string;
  /** 拖拽开始回调 */
  onStart?: (event: MouseEvent, position: { x: number; y: number }) => void;
  /** 拖拽中回调 */
  onMove?: (event: MouseEvent, position: { x: number; y: number }) => void;
  /** 拖拽结束回调 */
  onEnd?: (event: MouseEvent, position: { x: number; y: number }) => void;
  /** 初始位置 */
  initialPosition?: { x: number; y: number };
  /** 是否启用拖拽，默认 true */
  enabled?: boolean;
}

export interface DraggableState {
  isDragging: boolean;
  position: { x: number; y: number };
  startPosition: { x: number; y: number };
}

export function useDraggable(
  target: Ref<HTMLElement | null> | HTMLElement,
  options: DraggableOptions = {}
) {
  const {
    handle,
    bounds = false,
    onStart,
    onMove,
    onEnd,
    initialPosition = { x: 0, y: 0 },
    enabled = true
  } = options;

  const isDragging = ref(false);
  const position = ref({ ...initialPosition });
  const startPosition = ref({ x: 0, y: 0 });
  const dragStart = ref({ x: 0, y: 0 });

  let element: HTMLElement | null = null;
  let handleElement: HTMLElement | null = null;
  let boundsElement: HTMLElement | null = null;

  // 获取元素
  const getElement = () => {
    if (typeof target === "object" && "value" in target) {
      return target.value;
    }
    return target;
  };

  // 获取边界元素
  const getBoundsElement = () => {
    if (typeof bounds === "string") {
      return document.querySelector(bounds) as HTMLElement;
    }
    if (bounds === true) {
      return element?.parentElement || null;
    }
    return null;
  };

  // 计算边界限制
  const constrainPosition = (x: number, y: number) => {
    if (!boundsElement || !element) return { x, y };

    const boundsRect = boundsElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;

    const minX = boundsRect.left;
    const maxX = boundsRect.right - elementWidth;
    const minY = boundsRect.top;
    const maxY = boundsRect.bottom - elementHeight;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  };

  // 开始拖拽
  const handleMouseDown = (event: MouseEvent) => {
    if (!enabled) return;

    const targetElement = handleElement || element;
    if (!targetElement || event.target !== targetElement) return;

    event.preventDefault();
    isDragging.value = true;
    startPosition.value = { ...position.value };
    dragStart.value = { x: event.clientX, y: event.clientY };

    onStart?.(event, position.value);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 拖拽中
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value || !element) return;

    const deltaX = event.clientX - dragStart.value.x;
    const deltaY = event.clientY - dragStart.value.y;

    let newX = startPosition.value.x + deltaX;
    let newY = startPosition.value.y + deltaY;

    // 应用边界限制
    if (bounds) {
      const constrained = constrainPosition(newX, newY);
      newX = constrained.x;
      newY = constrained.y;
    }

    position.value = { x: newX, y: newY };
    element.style.transform = `translate(${newX}px, ${newY}px)`;

    onMove?.(event, position.value);
  };

  // 结束拖拽
  const handleMouseUp = (event: MouseEvent) => {
    if (!isDragging.value) return;

    isDragging.value = false;
    onEnd?.(event, position.value);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // 初始化
  const init = () => {
    element = getElement();
    if (!element) return;

    // 设置初始位置
    element.style.position = "relative";
    element.style.transform = `translate(${position.value.x}px, ${position.value.y}px)`;

    // 获取句柄元素
    if (handle) {
      handleElement = element.querySelector(handle);
    }

    // 获取边界元素
    boundsElement = getBoundsElement();

    // 添加事件监听
    element.addEventListener("mousedown", handleMouseDown);
  };

  // 销毁
  const destroy = () => {
    if (element) {
      element.removeEventListener("mousedown", handleMouseDown);
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // 设置位置
  const setPosition = (x: number, y: number) => {
    if (!element) return;

    let newX = x;
    let newY = y;

    if (bounds) {
      const constrained = constrainPosition(x, y);
      newX = constrained.x;
      newY = constrained.y;
    }

    position.value = { x: newX, y: newY };
    element.style.transform = `translate(${newX}px, ${newY}px)`;
  };

  // 重置位置
  const resetPosition = () => {
    setPosition(initialPosition.x, initialPosition.y);
  };

  // 启用/禁用拖拽
  const setEnabled = (enabled: boolean) => {
    if (!element) return;

    if (enabled) {
      element.style.cursor = "move";
    } else {
      element.style.cursor = "default";
    }
  };

  onMounted(init);
  onUnmounted(destroy);

  return {
    isDragging,
    position,
    setPosition,
    resetPosition,
    setEnabled,
    destroy
  };
}
