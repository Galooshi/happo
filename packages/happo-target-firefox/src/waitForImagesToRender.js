import findBackgroundImageUrls from './findBackgroundImageUrls';

export function waitForImageToLoad(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error(`Happo: Failed to load image with url ${url}`));
    img.addEventListener('load', resolve, { once: true });
    img.src = url;
  });
}

export default function waitForImagesToRender() {
  return new Promise((resolve, reject) => {
    const images = Array.prototype.slice.call(document.querySelectorAll('img'));
    const promises = images
      .map(img => img.src)
      .filter(Boolean)
      .map(waitForImageToLoad);

    images.forEach((img) => {
      const srcset = img.getAttribute('srcset');
      if (!srcset) {
        return;
      }

      srcset.split(/,\s*/).forEach((entry) => {
        const [url] = entry.split(' ');
        promises.push(waitForImageToLoad(url));
      });
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
