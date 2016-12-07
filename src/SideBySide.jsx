import React, { PropTypes } from 'react';

export default function SideBySide({ previous, current }) {
  return (
    <div className='SideBySide'>
      <img
        className='SideBySide__image'
        role='presentation'
        src={previous}
        title='Before'
      />
      {' '}
      <img
        className='SideBySide__image'
        role='presentation'
        src={current}
        title='After'
      />
    </div>
  );
}
SideBySide.propTypes = {
  previous: PropTypes.string.isRequired,
  current: PropTypes.string.isRequired,
};
