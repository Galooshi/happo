import React, { PropTypes } from 'react';

import InlineLink from './InlineLink';
import imageShape from './imageShape';
import imageSlug from './imageSlug';

export default function ImageHeading({ image }) {
  return (
    <h3 id={imageSlug(image)}>
      <InlineLink to={imageSlug(image)}>
        {image.description}
        {' @ '}
        {image.viewport}
      </InlineLink>
    </h3>
  );
}
ImageHeading.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};
