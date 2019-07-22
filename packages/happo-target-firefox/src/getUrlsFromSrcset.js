import parseSrcset from 'parse-srcset';

export default function getUrlsFromSrcset(value) {
  return parseSrcset(value).map((parsed) => parsed.url);
}
