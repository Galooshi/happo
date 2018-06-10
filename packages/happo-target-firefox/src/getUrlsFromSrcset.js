const SRCSET_ITEM = /([^\s]+)(\s+[0-9.]+[wx])?(,?\s*)/g;

export default function getUrlsFromSrcset(value) {
  const result = [];
  let match;
  while (match = SRCSET_ITEM.exec(value)) { // eslint-disable-line no-cond-assign
    result.push(match[1]);
  }
  return result;
}
