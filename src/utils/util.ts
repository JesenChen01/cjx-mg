export function sum(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

export function formatBytes(bytes: number) {
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  if (!Number.isFinite(bytes) || bytes <= 0) return `0 ${units[0]}`;
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${units[index]}`;
}

export function isNumber(val: unknown): val is number {
  return typeof val === "number";
}

export function isFunction(val: unknown): val is Function {
  return typeof val === "function";
}

export function isString(val: unknown): val is string {
  return typeof val === "string";
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export function isArray(val: unknown): val is any[] {
  return Array.isArray(val);
}

export function isPhone(val: unknown): val is string {
  return typeof val === "string" && /^1[3-9]\d{9}$/.test(val);
}

export function isEmail(val: unknown): val is string {
  return typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/**
 * 是否为空，针对 数组、对象、字符串、new Map()、new Set() 进行判断
 */
export function isEmpty(val: unknown): boolean {
  if (val == null) return true;

  if (Array.isArray(val)) return val.length === 0;

  if (typeof val === "string") return val.length === 0;

  if (val instanceof Map || val instanceof Set) return val.size === 0;

  if (Object.prototype.toString.call(val) === "[object Object]") {
    return Object.keys(val as Record<string, unknown>).length === 0;
  }

  return false;
}

/**
 * @description —是否为空，针对 数组、对象、字符串、new Map()、new Set()、null、undefined 进行判断，null、undefined 直接返回 true，也就是直接等于空
 * @param val — 需要判断的值
 * @returns — boolean
 */
export function isAllEmpty(val: unknown): boolean {
  if (val == null) return true;

  if (Array.isArray(val)) return val.length === 0;

  if (typeof val === "string") return val.length === 0;

  if (val instanceof Map || val instanceof Set) return val.size === 0;

  if (Object.prototype.toString.call(val) === "[object Object]") {
    return Object.keys(val as Record<string, unknown>).length === 0;
  }

  return false;
}

/**
 *
 * @description — 延迟函数
 * @param timeout — 延迟时间（毫秒），默认 20
 * @returns — Promise
 */
export function delay(timeout: number = 20): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * @description — 将秒转换为时、分、秒
 * @param seconds — 要转换的秒数（可以是小数，会向下取整）
 * @param bool — 是否补0，true 为补0，false 为不补0，默认true。当时、分、秒小于10时，会向前补0，如01:02:09
 * @returns — 时、分、秒
 */
export function getTime(seconds: number, bool: boolean = true) {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (bool) {
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return { h, m, s: ss };
  }

  return { h: hours, m: minutes, s: sec };
}

/**
 * @description — 检测设备类型（mobile 返回 true ，反之）
 */
export function deviceDetection() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * @description — 监听元素尺寸的变化，内置自定义防抖时长
 * @param element — 需要监听的元素
 * @param callback — 回调函数
 * @param debounceTime — 防抖时长，默认 20
 */
export function useResizeObserver(
  element:
    | HTMLElement
    | { value?: HTMLElement | null }
    | string
    | Array<HTMLElement | { value?: HTMLElement | null } | string>,
  callback: () => void,
  debounceTime: number = 20
) {
  let timer: number | null = null;
  const debounced = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(), debounceTime);
  };

  const normalizeToElements = (
    target:
      | HTMLElement
      | { value?: HTMLElement | null }
      | string
      | Array<HTMLElement | { value?: HTMLElement | null } | string>
  ): Element[] => {
    const list = Array.isArray(target) ? target : [target];
    const elements: Element[] = [];
    list.forEach(item => {
      if (!item) return;
      if (typeof item === "string") {
        const found = document.querySelectorAll(item);
        found && elements.push(...Array.from(found));
      } else if (
        item &&
        typeof (item as any) === "object" &&
        "value" in (item as any)
      ) {
        const el = (item as any).value as Element | null | undefined;
        if (el) elements.push(el);
      } else if (item instanceof Element) {
        elements.push(item);
      }
    });
    return elements;
  };

  const elements = normalizeToElements(element);
  if (elements.length === 0) {
    // 没有有效元素时，降级为 window.resize 监听
    const onResize = () => debounced();
    window.addEventListener("resize", onResize);
    return {
      stop: () => window.removeEventListener("resize", onResize),
      restart: () => window.addEventListener("resize", onResize)
    };
  }

  if (
    typeof window === "undefined" ||
    typeof (window as any).ResizeObserver === "undefined"
  ) {
    const onResize = () => debounced();
    window.addEventListener("resize", onResize);
    return {
      stop: () => window.removeEventListener("resize", onResize),
      restart: () => window.addEventListener("resize", onResize)
    };
  }

  const observer = new ResizeObserver(() => debounced());
  elements.forEach(el => observer.observe(el));

  return {
    stop: () => observer.disconnect(),
    restart: () => elements.forEach(el => observer.observe(el))
  };
}

/**
 * @description — 截取指定字符前面的值
 * @param val — 要截取的值
 * @param character — 指定字符
 * @returns — 截取后的值
 */
export function subBefore(val: string, character: string) {
  if (!character) return val;
  const pos = val.indexOf(character);
  return pos === -1 ? val : val.substring(0, pos);
}

/**
 * @description — 截取指定字符后面的值
 * @param val — 要截取的值
 * @param character — 指定字符
 * @returns — 截取后的值
 */
export function subAfter(val: string, character: string) {
  if (!character) return "";
  const pos = val.indexOf(character);
  return pos === -1 ? "" : val.substring(pos + character.length);
}

/**
 *
 * @description — 使用指定符号对指定的文字进行隐藏，默认使用 * 符号
 * @param text — 文字
 * @param index — 指定的文字索引或索引区间
 * @param symbol — 指定的符号
 * @returns — 隐藏后的文字
 *
 */
export function hideTextAtIndex(
  text: string,
  index: number | [number, number],
  symbol: string = "*"
) {
  if (Array.isArray(index)) {
    return (
      text.substring(0, index[0]) +
      symbol.repeat(index[1] - index[0]) +
      text.substring(index[1])
    );
  }
  return text.substring(0, index) + symbol + text.substring(index);
}

/**
 * @description — 从数组中获取指定 key 组成的新数组，会去重也会去除不存在的值
 * @param arr — 数组
 * @param key — 指定的 key
 * @param duplicates — 是否去重，默认 true 去重
 */
export function getKeyList(
  arr: any[],
  key: string,
  duplicates: boolean = true
) {
  if (duplicates) {
    return arr
      .map(item => item[key])
      .filter(Boolean)
      .filter((item, index, self) => self.indexOf(item) === index);
  }
  return arr.map(item => item[key]).filter(Boolean);
}

/**
 * @description — 从对象中删除指定的属性
 * @param obj — 需要删除属性的对象
 * @param props — 指定要删除的属性，可以是单个属性名(字符串)或一个属性名字符串数组
 * @returns — 返回修改后的新对象，不会修改原始对象
 */
export function delObjectProperty(
  obj: Record<string, unknown>,
  props: string | string[]
) {
  const propList = Array.isArray(props) ? props : [props];
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    if (!propList.includes(key)) acc[key] = obj[key];
    return acc;
  }, {});
}

/**
 * @description — url 链接正则
 */
export function isUrl(val: unknown): val is string {
  return typeof val === "string" && /^https?:\/\//.test(val);
}

/**
 *
 * @description — 向组件中添加install方法，使其既可以使用app.component注册又可以使用app.use安装，且无需考虑TypeScript类型
 * @param main — 主组件（第一个被注册的组件）
 * @param extra — 额外组件，对象格式（会按照传入的先后顺序注册）
 * @notice — 每个使用withInstall的组件都应该有个唯一name，以便兼容各种场景。如果要在全局中使用，组件名需传name值
 */
export function withInstall(main: any, extra?: any) {
  main.install = (app: any) => {
    app.component(main.name, main);
    extra?.forEach((component: any) => {
      app.component(component.name, component);
    });
  };
  return main;
}

/**
 * @description — 基于 base64 下载图片
 * @param buf — base64
 * @param filename — 文件名
 * @param mime — 类型
 * @param bom — BlobPart
 *
 */
export function downloadByBase64(
  buf: string,
  filename: string,
  mime: string = "image/png",
  bom: BlobPart = null
) {
  if (typeof window === "undefined") return;
  const base64Data = buf.startsWith("data:") ? buf.split(",")[1] : buf;
  const binary = atob(base64Data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob(bom ? [bom, bytes] : [bytes], { type: mime });
  const link = document.createElement("a");
  const url = window.URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * 解析传入的SVG字符串并提取其关键信息

 * @param svgStr — 包含SVG内容的字符串，格式为标准的SVG XML
 * @returns 返回一个包含SVG信息的对象 SvgInfo，包括以下属性：
 * SVG的宽度，基于viewBox属性的第三个值
 * SVG的高度，基于viewBox属性的第四个值
 * SVG中所有<path>元素的outerHTML连接而成的字符串
 *
*/
export function getSvgInfo(svgStr: string) {
  if (typeof window === "undefined") return { width: 0, height: 0, body: "" };
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return { width: 0, height: 0, body: "" };
  const viewBox = svg.getAttribute("viewBox") || "0 0 0 0";
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  const paths = Array.from(svg.querySelectorAll("path"))
    .map(p => p.outerHTML)
    .join("");
  return {
    width: w || Number(svg.getAttribute("width")) || 0,
    height: h || Number(svg.getAttribute("height")) || 0,
    body: paths || svg.innerHTML
  };
}

/**
 *
 * @description — 向当前元素添加指定类名
 * @param element — 当前元素
 * @param name — 类名
 * @param extraName — 额外类名（可选）
 */
export function addClass(
  element: HTMLElement,
  name: string,
  extraName?: string
) {
  element.classList.add(name);
  if (extraName) {
    element.classList.add(extraName);
  }
}

/**
 *
 * @description — 删除当前元素的指定类名
 * @param element — 当前元素
 * @param name — 类名
 * @param extraName — 额外类名（可选）
 */
export function removeClass(
  element: HTMLElement,
  name: string,
  extraName?: string
) {
  element.classList.remove(name);
  if (extraName) {
    element.classList.remove(extraName);
  }
}

/**
 * @description — 是否向当前元素添加指定类名
 * @param bool — boolean
 * @param name — 类名
 * @param element — 当前元素（可选，如果不填，默认 document.body ）
 */
export function toggleClass(
  bool: boolean,
  name: string,
  element?: HTMLElement
) {
  element = element || document.body;
  if (bool) {
    element.classList.add(name);
  } else {
    element.classList.remove(name);
  }
}

/**
 * @description — 判断元素是否存在指定类名
 *  @param element — 当前类名的元素
 * @param name — 类名
 * @returns — boolean
 *
 */
export function hasClass(element: HTMLElement, name: string) {
  return element.classList.contains(name);
}

/**
 * @description — 复制文本到剪贴板
 * @param input — 要复制的文本
 * @param target — 可选，挂载隐藏输入框的容器元素，默认 document.body
 * @returns 是否复制成功
 */
export function copyTextToClipboard(
  input: string,
  { target }: { target?: HTMLElement } = {}
): boolean {
  if (typeof window === "undefined") return false;

  // 优先使用原生 Clipboard API（异步）
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      navigator.clipboard.writeText(input);
      return true;
    } catch {
      // 降级到 execCommand
    }
  }

  // 回退方案：使用隐藏的 textarea + execCommand
  const container = target || document.body;
  const textarea = document.createElement("textarea");
  textarea.value = input;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  container.appendChild(textarea);

  const selection = document.getSelection();
  const selectedRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  container.removeChild(textarea);
  if (selectedRange && selection) {
    selection.removeAllRanges();
    selection.addRange(selectedRange);
  }
  return ok;
}

/**
 *
 * @description — 颜色值加深
 * @param color — hex 格式
 * @param level — 色值度
 * @returns — 加深后的颜色值，hex 格式
 */
export function darken(color: string, level: number) {
  // level 建议 0~1，越大越暗（与黑色混合）
  const hex = color.replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map(c => c + c)
          .join("")
      : hex;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (ch: number) => Math.round(ch * (1 - level));
  const rr = Math.max(0, Math.min(255, mix(r)))
    .toString(16)
    .padStart(2, "0");
  const gg = Math.max(0, Math.min(255, mix(g)))
    .toString(16)
    .padStart(2, "0");
  const bb = Math.max(0, Math.min(255, mix(b)))
    .toString(16)
    .padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}

/**
 *
 * @description — 颜色值变浅
 * @param color — hex 格式
 * @param level — 色值度
 * @returns — 变浅后的颜色值，hex 格式
 */
export function lighten(color: string, level: number) {
  // level 建议 0~1，越大越亮（与白色混合）
  const hex = color.replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map(c => c + c)
          .join("")
      : hex;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (ch: number) => Math.round(ch + (255 - ch) * level);
  const rr = Math.max(0, Math.min(255, mix(r)))
    .toString(16)
    .padStart(2, "0");
  const gg = Math.max(0, Math.min(255, mix(g)))
    .toString(16)
    .padStart(2, "0");
  const bb = Math.max(0, Math.min(255, mix(b)))
    .toString(16)
    .padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}

/**
 *
 * @description — 创建超链接
 * @param href — 超链接地址
 * @param target — Target
 */
export function openLink(href: string, target: TargetContext = "_blank") {
  if (typeof window === "undefined") return;
  window.open(href, target);
}

/**
 * @description — 获取由基本数据类型组成的数组交集
 */
export function intersection(arr1: any[], arr2: any[]) {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * @description — 判断一个数组（这里简称为母体）中是否包含了另一个由基本数据类型组成的数组（这里简称为子体）中的全部元素
 * @param c — 子体
 * @param m — 母体
 *
 */
export function isIncludeAllChildren(c: any[], m: any[]) {
  return c.every(item => m.includes(item));
}

/**
 * @description — 提取浏览器 url 中所有参数
 * @param url — 超链接地址
 * @returns — 所有参数组成的对象
 *
 */
export function getQueryMap(url: string) {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return {} as Record<string, string>;
  const hashIndex = url.indexOf("#", queryIndex);
  const raw = url.slice(
    queryIndex + 1,
    hashIndex === -1 ? undefined : hashIndex
  );
  if (!raw) return {} as Record<string, string>;
  return raw.split("&").reduce(
    (acc: Record<string, string>, curr) => {
      if (!curr) return acc;
      const [k, v = ""] = curr.split("=");
      const key = decodeURIComponent(k || "");
      const value = decodeURIComponent(v);
      if (key) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * @description — 提取对象数组中的任意字段，返回一个新的数组
 *
 */
export function extractFields(arr: any[], field: string) {
  return arr.map(item => item[field]);
}

/**
 * @description — 根据后台接口文件流下载
 *  @param data — 文件流
 *  @param filename — 文件名
 *  @param mime — 类型
 *  @param bom — BlobPart
 *
 */
export function downloadByData(
  data: any,
  filename: string,
  mime: string = "application/octet-stream",
  bom: BlobPart = null
) {
  if (typeof window === "undefined") return;
  const blobParts = bom ? [bom, data] : [data];
  const blob = new Blob(blobParts, { type: mime });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * 下载在线图片（支持跨域）
 * @param url      图片地址
 * @param filename 文件名（含扩展名）
 * @param mime     MIME 类型（默认 image/png）
 * @param bom      可选 BOM（UTF-8 签名等）
 */
export async function downloadByOnlineUrl(
  url: string,
  filename: string,
  mime = "image/png",
  bom: BlobPart | null = null
): Promise<void> {
  if (typeof window === "undefined" || !url) return;

  try {
    // 1. 通过 fetch 拿到跨域图片
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(res.statusText);

    // 2. 组装 Blob
    let blob = await res.blob();
    if (bom) blob = new Blob([bom, blob], { type: mime });

    // 3. 创建临时 URL 并触发下载
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // 4. 清理
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);
  } catch (err) {
    console.error("download image failed:", err);
  }
}

/**
 * @description — 根据文件地址下载文件
 * @param url — 文件地址
 * @param fileName — 文件名
 * @param target — Target，默认 _self
 *
 */
export function downloadByUrl(
  url: string,
  fileName: string,
  target: TargetContext = "_self"
) {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = target;
  link.click();
}

/**
 * @description — 随机生成渐变色
 */
export function randomGradient() {
  return `linear-gradient(to right, ${randomColor()}, ${randomColor()})`;
}

/**
 * @description — 生成随机十六进制颜色，如 #a1b2c3
 */
export function randomColor() {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0")}`;
}

/**
 * @description — 处理 FormData 传参，比 formDataHander 更灵活强大
 */
export type FormDataOptions = {
  /** 数组格式：indices => a[0], brackets => a[], repeat => a=a1&a=a2 */
  arrayFormat?: "indices" | "brackets" | "repeat";
  /** 是否保留 null/undefined，默认 false（跳过） */
  includeNull?: boolean;
  /** 自定义值序列化（在默认序列化前调用） */
  serializer?: (value: any, key: string) => string | Blob | File;
  /** 可选 key 转换，如转下划线等 */
  keyTransform?: (key: string) => string;
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function createFormData(
  obj: Record<string, any>,
  options: FormDataOptions = {}
): FormData {
  const {
    arrayFormat = "indices",
    includeNull = false,
    serializer,
    keyTransform
  } = options;

  const formData = new FormData();

  const appendValue = (fd: FormData, key: string, value: any) => {
    const k = keyTransform ? keyTransform(key) : key;
    if (serializer) {
      const out = serializer(value, k);
      if (out instanceof Blob || typeof out === "string") {
        fd.append(k, out as any);
        return;
      }
    }
    if (value instanceof Blob) {
      fd.append(k, value);
    } else if (value instanceof Date) {
      fd.append(k, value.toISOString());
    } else if (typeof value === "boolean" || typeof value === "number") {
      fd.append(k, String(value));
    } else if (typeof value === "string") {
      fd.append(k, value);
    } else if (value == null) {
      if (includeNull) fd.append(k, "");
    } else {
      fd.append(k, String(value));
    }
  };

  const build = (fd: FormData, data: any, parentKey?: string) => {
    if (data == null) {
      if (includeNull && parentKey) fd.append(parentKey, "");
      return;
    }
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        let key = parentKey || "";
        if (!key) return;
        if (arrayFormat === "indices") key = `${key}[${index}]`;
        else if (arrayFormat === "brackets") key = `${key}[]`;
        // repeat 模式使用相同 key
        if (isPlainObject(item) || Array.isArray(item)) build(fd, item, key);
        else appendValue(fd, key, item);
      });
      return;
    }
    if (isPlainObject(data)) {
      Object.keys(data).forEach(childKey => {
        const value = data[childKey];
        const key = parentKey ? `${parentKey}[${childKey}]` : childKey;
        if (isPlainObject(value) || Array.isArray(value)) build(fd, value, key);
        else appendValue(fd, key, value);
      });
      return;
    }
    if (parentKey) appendValue(fd, parentKey, data);
  };

  build(formData, obj);
  return formData;
}
