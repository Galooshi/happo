happo.define('tinyImage', function() {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.onload = function() {
      // Continue to process the image once it is found without any errors
      resolve();
    };
    image.onerror = function() {
      // Throws an error if the image is not found.
      // The error message will then show up in std_err, so for our test,
      // we can check that the error message should not show up.
      reject(new Error('image not found'));
    };
    image.src = '/tinyImage.gif';
    document.body.appendChild(image);
  });
});
