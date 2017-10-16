import React from 'react';
import ReactDOM from 'react-dom';

import HappoDiffs from './HappoDiffs';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('react-root');
  // We are on the review page
  ReactDOM.render(
    <HappoDiffs
      {...window.APP_PROPS}
    />,
    rootElement,
  );
});
