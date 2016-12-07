import React, { PropTypes } from 'react';

import { DiffController } from './Diff';
import InlineLink from './InlineLink';
import imageShape from './imageShape';

export default function DiffImages({ images }) {
  if (!images.length) {
    return null;
  }

  return (
    <div>
      <h2 id='diffs'>
        <InlineLink to='diffs'>
          Diffs ({ images.length })
        </InlineLink>
      </h2>

      {images.map(image => (
        <DiffController
          key={image.current}
          image={image}
        />
      ))}
    </div>
  );
}
DiffImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape(imageShape)).isRequired,
};
