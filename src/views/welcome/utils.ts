export { default as dayjs } from "dayjs";
export { useDark } from "@/composable/useDark";
export { randomGradient } from "@/utils/util";

export { cloneDeep } from "lodash-es";

export function getRandomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
