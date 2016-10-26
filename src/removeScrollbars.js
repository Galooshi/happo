function isAutoOrScroll(overflow) {
  return overflow === 'auto' || overflow === 'scroll';
}

// Scrollbars inside of elements may cause spurious visual diffs. To avoid
// this issue, we can hide them automatically by styling the overflow to be
// hidden.
export default function removeScrollbars(node) {
  const isOverflowing =
    node.scrollHeight !== node.clientHeight
    || node.scrollWidth !== node.clientWidth;

  if (!isOverflowing) {
    // This node has no overflowing content. We're returning early to prevent
    // calling getComputedStyle down below (which is an expensive operation).
    return;
  }

  const style = window.getComputedStyle(node);
  if (
    isAutoOrScroll(style.getPropertyValue('overflow-y'))
    || isAutoOrScroll(style.getPropertyValue('overflow-x'))
    || isAutoOrScroll(style.getPropertyValue('overflow'))
  ) {
    // We style this via node.style.cssText so that we can override any styles
    // that might already be `!important`.
    // eslint-disable-next-line no-param-reassign
    node.style.cssText += 'overflow: hidden !important';
  }
}
