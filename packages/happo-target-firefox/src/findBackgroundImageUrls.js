const URL_PATTERN = /(?:url\(['"]?)(.*?)(?:['"]?)\)/g;

export default function findBackgroundImageUrls(string) {
  const result = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while (match = URL_PATTERN.exec(string)) {
    result.push(match[1]);
  }
  return result;
}
