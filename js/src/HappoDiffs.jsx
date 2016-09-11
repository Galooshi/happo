import React, { PropTypes } from 'react';

import DiffImages from './DiffImages';
import NewImages from './NewImages';
import imageShape from './imageShape';

export default function HappoDiffs({ pageTitle, generatedAt, diffImages, newImages }) {
  return (
    <div>
      <header className='HappoDiffs__header'>
        <h1 className='HappoDiffs__headerTitle'>
          {pageTitle}
        </h1>
        <div className='HappoDiffs__headerTime'>
          Generated: {generatedAt}
        </div>
      </header>

      <main className='HappoDiffs__main'>
        <DiffImages
          images={diffImages}
        />
        <NewImages
          images={newImages}
        />
      </main>
    </div>
  );
}
HappoDiffs.propTypes = {
  pageTitle: PropTypes.string.isRequired,
  diffImages: PropTypes.arrayOf(imageShape).isRequired,
  newImages: PropTypes.arrayOf(imageShape).isRequired,
  generatedAt: PropTypes.string.isRequired,
};
