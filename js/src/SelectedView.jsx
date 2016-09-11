import React, { PropTypes } from 'react';

import LCSDiff from './LCSDiff';
import SideBySide from './SideBySide';
import Swiper from './Swiper';
import VIEWS from './VIEWS';
import imageShape from './imageShape';

export default function SelectedView({ image, selectedView }) {
  if (selectedView === VIEWS.SIDE_BY_SIDE) {
    return (
      <SideBySide
        previous={image.previous}
        current={image.current}
      />
    );
  }

  if (selectedView === VIEWS.DIFF) {
    return (
      <LCSDiff
        previous={image.previous}
        current={image.current}
      />
    );
  }

  if (selectedView === VIEWS.SWIPE) {
    return (
      <Swiper
        previous={image.previous}
        current={image.current}
      />
    );
  }
}
SelectedView.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
  selectedView: PropTypes.oneOf(Object.keys(VIEWS).map(key => VIEWS[key])).isRequired,
};
