function waitForImageToLoad(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error(`Failed to load image with url ${url}`));
    img.onload = resolve;
    img.src = url;
  });
}

export default function waitForImagesToRender() {
  return new Promise((resolve, reject) => {
    const promises = Array.prototype.slice.call(document.querySelectorAll('img'))
      .map(img => img.src)
      .filter(Boolean)
      .map(url => waitForImageToLoad(url));

    document.body.querySelectorAll('*').forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const bgImage = computedStyle.getPropertyValue('background-image');
      if (bgImage && bgImage.startsWith('url(')) {
        const url = computedStyle.getPropertyValue('background-image')
          .replace(/^url\(['"]/, '').replace(/['"]?\)$/, '');
        promises.push(waitForImageToLoad(url));
      }
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
