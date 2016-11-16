import removeScrollbars from './removeScrollbars';

/**
 * Wrapper around Math.min to handle undefined values.
 */
function min(a, b) {
  if (a === undefined) {
    return b;
  }
  return Math.min(a, b);
}

// This function takes a node and a box object that we will mutate.
function getFullRectRecursive(node, box) {
  // Since we are already traversing through every node, let's piggyback on
  // that work and remove scrollbars to prevent spurious diffs.
  removeScrollbars(node);

  const rect = node.getBoundingClientRect();

  /* eslint-disable no-param-reassign */
  box.bottom = Math.max(box.bottom, rect.bottom);
  box.left = min(box.left, rect.left);
  box.right = Math.max(box.right, rect.right);
  box.top = min(box.top, rect.top);
  /* eslint-enable no-param-reassign */

  for (let i = 0; i < node.children.length; i++) {
    getFullRectRecursive(node.children[i], box);
  }
}

// This function gets the full size of children in the document body,
// including all descendent nodes. This allows us to ensure that the
// screenshot includes absolutely positioned elements. It is important that
// this is fast, since we may be iterating over a high number of nodes.
export default function getFullRect(rootNodes) {
  // Set up the initial object that we will mutate in our recursive function.
  const box = {
    bottom: 0,
    left: undefined,
    right: 0,
    top: undefined,
  };

  // If there are any children, we want to iterate over them recursively,
  // mutating our box object along the way to expand to include all descendent
  // nodes.
  // Remember! rootNodes can be either an Array or a NodeList.
  for (let i = 0; i < rootNodes.length; i++) {
    const node = rootNodes[i];

    getFullRectRecursive(node, box);

    // getBoundingClientRect does not include margin, so we need to use
    // getComputedStyle. Since this is slow and the margin of descendent
    // elements is significantly less likely to matter, let's include the
    // margin only from the topmost nodes.
    const computedStyle = window.getComputedStyle(node);
    box.bottom += parseFloat(computedStyle.getPropertyValue('margin-bottom') || 0);
    box.left -= parseFloat(computedStyle.getPropertyValue('margin-left') || 0);
    box.right += parseFloat(computedStyle.getPropertyValue('margin-right') || 0);
    box.top -= parseFloat(computedStyle.getPropertyValue('margin-top') || 0);
  }

  // Since getBoundingClientRect() and margins can contain subpixel values, we
  // want to round everything before calculating the width and height to
  // ensure that we will take a screenshot of the entire component.
  box.bottom = Math.ceil(box.bottom);
  box.left = Math.floor(box.left);
  box.right = Math.ceil(box.right);
  box.top = Math.floor(box.top);

  // As the last step, we calculate the width and height for the box. This is
  // to avoid having to do them for every node. Before we do that however, we
  // cut off things that render off the screen to the top or left, since those
  // won't be in the screenshot file that we then crop from. If you're
  // wondering why right and bottom isn't "fixed" here too, it's because we
  // don't have to since the screenshot already includes overflowing content
  // on the bottom and right.
  box.left = Math.max(box.left, 0);
  box.top = Math.max(box.top, 0);

  box.width = box.right - box.left;
  box.height = box.bottom - box.top;

  return box;
}
