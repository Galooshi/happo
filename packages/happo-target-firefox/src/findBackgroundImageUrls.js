const URL_PATTERN = /(?:url\(['"]?)(.*?)(?:['"]?)\)/g;

export default function findBackgroundImageUrls(string) {
  const result = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while (match = URL_PATTERN.exec(string)) {
    // Inlined images of the form data:image can contain embedded svg.
    // To avoid failing to load this image, we need to unescape escaped single quotes.
    const url = match[1].replace(/\\'/g, "'");
    result.push(url);
  }
  return result;
}
