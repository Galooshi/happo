import React, { PropTypes } from 'react';

import InlineLink from './InlineLink';
import NewImage from './NewImage';
import imageShape from './imageShape';

export default function NewImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='new'>
        <InlineLink to='new'>
          New examples ({ images.length })
        </InlineLink>
      </h2>

      {images.map(image => (
        <NewImage
          key={image.current}
          image={image}
        />
      ))}
    </div>
  );
}
NewImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape(imageShape)).isRequired,
};
