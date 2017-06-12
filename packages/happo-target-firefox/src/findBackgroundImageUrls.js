const URL_PATTERN = /(?:url\(['"]?)(.*?)(?:['"]?)\)/g;

export default function findBackgroundImageUrls(string) {
  const result = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while (match = URL_PATTERN.exec(string)) {
    // We need to unescape the simple quote.
    const url = match[1].replace(/\\'/g, "'");
    result.push(url);
  }
  return result;
}
