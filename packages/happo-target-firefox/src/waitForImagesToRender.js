import findBackgroundImageUrls from './findBackgroundImageUrls';

function waitForImageToLoad(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error(`Happo: Failed to load image with url ${url}`));
    img.addEventListener('load', resolve, { once: true });
    img.src = url;
  });
}

export default function waitForImagesToRender() {
  return new Promise((resolve, reject) => {
    const promises = Array.prototype.slice.call(document.querySelectorAll('img'))
      .map(img => img.src)
      .filter(Boolean)
      .map(waitForImageToLoad);

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
