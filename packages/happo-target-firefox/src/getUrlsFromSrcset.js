import matchAll from 'string.prototype.matchall';

const SRCSET_ITEM = /([^\s]+)(\s+[0-9.]+[wx])?(,?\s*)/g;

export default function getUrlsFromSrcset(value) {
  return Array.from(matchAll(value, SRCSET_ITEM), groups => groups[1]);
}
