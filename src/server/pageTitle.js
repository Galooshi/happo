module.exports = function pageTitle({
  diffImages,
  newImages,
}) {
  const title = [];
  if (diffImages.length === 1) {
    title.push('1 diff');
  } else if (diffImages.length > 1) {
    title.push(`${diffImages.length} diffs`);
  }
  if (newImages.length) {
    title.push(`${newImages.length} new`);
  }

  if (!title.length) {
    return 'Happo';
  }

  return `${title.join(', ')} · Happo`;
};
