type StorageValue = string | number | boolean | null | undefined | object;

export function storageLocal() {
  return {
    /** 读取并返回真实值 */
    getItem<T = StorageValue>(key: string): T | null {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;

      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    /** 写入任意值（包装成对象再序列化） */
    setItem<T extends StorageValue>(key: string, value: T): void {
      localStorage.setItem(key, JSON.stringify(value));
    },

    removeItem(key: string): void {
      localStorage.removeItem(key);
    },

    clear(): void {
      localStorage.clear();
    }
  };
}
