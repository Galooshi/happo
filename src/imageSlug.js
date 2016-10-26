export default function imageSlug(image) {
  return btoa(image.description + image.viewport);
}
