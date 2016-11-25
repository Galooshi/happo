function isOpaque(color) {
  return color[3] === 255;
}

function isFullyTransparent(color) {
  return color[3] === 0;
}

/**
 * Multiplies two fractions using integer math, where the fractions are stored
 * using an integer between 0 and 255. This method is used as a helper method
 * for compositing colors using integer math.
 *
 * This is a quicker implementation of Math.round((a * b) / 255.0)
 */
function int8Mult(a, b) {
  const t = (a * b) + 0x80;
  // eslint-disable-next-line no-bitwise
  return ((t >> 8) + t) >> 8;
}

/**
 * Composes two colors with an alpha channel using integer math.
 *
 * This version is faster than a version based on floating point math.
 */
export default function compose(foreground, background) {
  if (isOpaque(foreground) || isFullyTransparent(background)) {
    return foreground;
  }

  if (isFullyTransparent(foreground)) {
    return background;
  }

  const aCom = int8Mult(0xff - foreground[3], background[3]);
  return [
    int8Mult(foreground[3], foreground[0]) + int8Mult(aCom, background[0]),
    int8Mult(foreground[3], foreground[1]) + int8Mult(aCom, background[1]),
    int8Mult(foreground[3], foreground[2]) + int8Mult(aCom, background[2]),
    foreground[3] + aCom,
  ];
}
