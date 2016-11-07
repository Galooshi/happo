import cssesc from 'cssesc';

export default function imageSlug(image) {
  return cssesc(`${image.description}@${image.viewport}`);
}
