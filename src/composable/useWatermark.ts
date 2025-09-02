/**
 * 给元素加水印，自适应容器
 */

import { ref, onBeforeUnmount, type Ref } from "vue";

export interface WatermarkOptions {
  type?: "text" | "image"; // 水印类型
  content?: string; // 文字内容或图片 URL
  fontSize?: number; // 字体大小
  fontFamily?: string;
  color?: string;
  rotate?: number; // 旋转角度（deg）
  opacity?: number; // 0-1
  globalAlpha?: number; // 全局透明度
  gap?: [number, number]; // 横向、纵向间距
  offset?: [number, number]; // 起始偏移
  width?: number; // 水印宽度
  height?: number; // 水印高度
  forever?: boolean; // 是否永久水印
  gradient?: Array<{ value: number; color: string }>; // 渐变配置
  shadowConfig?: number[]; // 阴影配置
}

const defaultOpts: Required<WatermarkOptions> = {
  type: "text",
  content: "watermark",
  fontSize: 14,
  fontFamily: "sans-serif",
  color: "rgba(0,0,0,.15)",
  rotate: -20,
  opacity: 1,
  globalAlpha: 0.15,
  gap: [100, 100],
  offset: [0, 0],
  width: 120,
  height: 64,
  forever: false,
  gradient: [],
  shadowConfig: []
};

export function useWatermark(
  container?: Ref<HTMLElement | null> | HTMLElement,
  opts: WatermarkOptions = {}
) {
  const options = Object.assign(
    {},
    defaultOpts,
    opts
  ) as Required<WatermarkOptions>;
  const watermarkEl = ref<HTMLDivElement | null>(null);
  const resizeObserver = ref<ResizeObserver | null>(null);
  const mutationObserver = ref<MutationObserver | null>(null);

  // 获取容器元素
  const getContainer = () => {
    if (!container) return document.body;
    if (typeof container === "object" && "value" in container) {
      return container.value || document.body;
    }
    return container;
  };

  /* 创建水印 Canvas */
  function createCanvas() {
    const {
      fontSize,
      fontFamily,
      color,
      rotate,
      content,
      type,
      width,
      height,
      globalAlpha,
      gradient,
      shadowConfig
    } = options;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = width;
    canvas.height = height;

    ctx.globalAlpha = globalAlpha;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 应用渐变
    if (gradient.length > 0) {
      const gradientObj = ctx.createLinearGradient(0, 0, width, height);
      gradient.forEach(g => {
        gradientObj.addColorStop(g.value, g.color);
      });
      ctx.fillStyle = gradientObj;
    } else {
      ctx.fillStyle = color;
    }

    // 应用阴影
    if (shadowConfig.length > 0) {
      ctx.shadowOffsetX = shadowConfig[0] || 0;
      ctx.shadowOffsetY = shadowConfig[1] || 0;
      ctx.shadowBlur = shadowConfig[2] || 0;
      ctx.shadowColor =
        (shadowConfig[3] as unknown as string) || "rgba(0,0,0,0.3)";
    }

    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);

    if (type === "text") {
      ctx.fillText(content, 0, 0);
    } else {
      // 简单示例：图片水印
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = content as string;
      img.onload = () => ctx.drawImage(img, -img.width / 2, -img.height / 2);
    }
    return canvas;
  }

  /* 绘制水印 */
  function draw() {
    const targetContainer = getContainer();
    if (!targetContainer) return;
    clear();

    const canvas = createCanvas();
    watermarkEl.value = document.createElement("div");
    watermarkEl.value.style.cssText = `
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      pointer-events:none;
      z-index:9999;
      background-repeat:repeat;
      background-image:url(${canvas.toDataURL()});
      background-position:${options.offset[0]}px ${options.offset[1]}px;
    `;
    targetContainer.style.position = "relative";
    targetContainer.appendChild(watermarkEl.value);

    /* 监听尺寸变化，自动重绘 */
    if (window.ResizeObserver) {
      resizeObserver.value = new ResizeObserver(() => draw());
      resizeObserver.value.observe(targetContainer);
    }

    /* 简单防删：重新添加 */
    if (window.MutationObserver && options.forever) {
      mutationObserver.value = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.removedNodes.forEach(n => {
            if (n === watermarkEl.value) {
              targetContainer?.appendChild(watermarkEl.value!);
            }
          });
        });
      });
      mutationObserver.value.observe(targetContainer, { childList: true });
    }
  }

  /* 清空 */
  function clear() {
    if (watermarkEl.value) {
      watermarkEl.value.remove();
      watermarkEl.value = null;
    }
  }

  /* 设置水印 */
  function setWatermark(
    content: string,
    newOpts: Partial<WatermarkOptions> = {}
  ) {
    Object.assign(options, { content }, newOpts);
    draw();
  }

  /* 更新配置并重绘 */
  function update(newOpts: Partial<WatermarkOptions> = {}) {
    Object.assign(options, newOpts);
    draw();
  }

  /* 停止所有观察 */
  function stopObserve() {
    resizeObserver.value?.disconnect();
    mutationObserver.value?.disconnect();
  }

  onBeforeUnmount(() => {
    stopObserve();
    clear();
  });

  return {
    setWatermark,
    draw,
    update,
    clear,
    stopObserve
  };
}
