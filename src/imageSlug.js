import cssesc from 'cssesc';

export default function imageSlug({ description, viewportName }) {
  return cssesc(`${description}@${viewportName}`);
}
