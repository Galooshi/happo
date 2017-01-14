happo.define('tinyImage', () =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      // Continue to process the image once it is found without any errors
      resolve();
    };
    image.onerror = () => {
      // Throws an error if the image is not found.
      // The error message will then show up in std_err, so for our test,
      // we can check that the error message should not show up.
      reject(new Error('image not found'));
    };
    image.src = '/tinyImage.gif';
    document.body.appendChild(image);
  }));
