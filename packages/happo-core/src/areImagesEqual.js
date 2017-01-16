
function areImagesEqual(a, b) {
  if (a.height !== b.height) {
    return false;
  }
  if (a.width !== b.width) {
    return false;
  }
  const len = a.data.length;
  for (let i = 0; i < len; i += 1) {
    if (a.data[i] !== b.data[i]) {
      return false;
    }
  }
  return true;
}

module.exports = areImagesEqual;
