import findBackgroundImageUrls from './findBackgroundImageUrls';
import getUrlsFromSrcset from './getUrlsFromSrcset';

export function waitForImageToLoad(imageOrUrl) {
  return new Promise((resolve, reject) => {
    let url = imageOrUrl;
    let crossOrigin;
    if (typeof imageOrUrl !== 'string') {
      url = imageOrUrl.src;
      crossOrigin = imageOrUrl.crossOrigin;
    }
    const img = new Image();
    img.onerror = () => reject(new Error(`Happo: Failed to load image with url ${url}`));
    img.addEventListener('load', resolve, { once: true });
    img.crossOrigin = crossOrigin;
    img.src = url;
  });
}

export default function waitForImagesToRender() {
  return new Promise((resolve, reject) => {
    const images = Array.prototype.slice.call(document.querySelectorAll('img'));
    const promises = images
      .filter(({ src }) => !!src)
      .map(waitForImageToLoad);

    images.forEach((img) => {
      const srcset = img.getAttribute('srcset');
      if (!srcset) {
        return;
      }

      promises.push(...getUrlsFromSrcset(srcset).map(waitForImageToLoad));
    });

    Array.prototype.slice.call(document.body.querySelectorAll('*'))
      .forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const urls = findBackgroundImageUrls(
          computedStyle.getPropertyValue('background-image'));
        promises.push(...urls.map(waitForImageToLoad));
      });

    if (promises.length === 0) {
      // There are no images to wait for, so we can just resolve right away.
      resolve();
    }

    Promise.all(promises).then(() => {
      // Now that the images have loaded, we need to wait for a couple of
      // animation frames to go by before we think they will have finished
      // rendering.
      requestAnimationFrame(() => {
        // Start render
        requestAnimationFrame(() => {
          // Finish rendering
          resolve();
        });
      });
    }).catch(reject);
  });
}
