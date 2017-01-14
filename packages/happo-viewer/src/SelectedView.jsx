import React, { PropTypes } from 'react';

import ComponentCacher from './ComponentCacher';
import LCSDiff from './LCSDiff';
import SideBySide from './SideBySide';
import Swiper from './Swiper';
import VIEWS from './VIEWS';
import imageShape from './imageShape';

export default function SelectedView({ image, selectedView }) {
  return (
    <div>
      <ComponentCacher visible={selectedView === VIEWS.SIDE_BY_SIDE}>
        <SideBySide
          previous={image.previous}
          current={image.current}
        />
      </ComponentCacher>
      <ComponentCacher visible={selectedView === VIEWS.DIFF}>
        <LCSDiff
          previous={image.previous}
          current={image.current}
        />
      </ComponentCacher>
      <ComponentCacher visible={selectedView === VIEWS.SWIPE}>
        <Swiper
          previous={image.previous}
          current={image.current}
        />
      </ComponentCacher>
    </div>
  );
}
SelectedView.propTypes = {
  image: PropTypes.shape(imageShape).isRequired,
  selectedView: PropTypes.oneOf(Object.keys(VIEWS).map(key => VIEWS[key])).isRequired,
};
