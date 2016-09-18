import React, { PropTypes } from 'react';

import ImageHeading from './ImageHeading';
import imageShape from './imageShape';

export default function NewImage({ image }) {
  return (
    <div>
      <ImageHeading
        image={image}
      />
      <div
        className='NewImage__image'
        style={{
          minHeight: image.height,
        }}
      >
        <img
          role='presentation'
          src={image.current}
        />
      </div>
    </div>
  );
}
NewImage.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
};
