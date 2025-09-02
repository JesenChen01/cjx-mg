/**
 * 使元素可自定义缓动
 */

export function useScrollTo() {
  const scrollTo = (
    element: HTMLElement,
    to: number,
    duration: number = 300,
    easing: (t: number) => number = (t: number) => t * (2 - t) // easeOutQuad
  ) => {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      element.scrollTop = start + change * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return { scrollTo };
}
