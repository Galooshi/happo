import React from 'react';
import ReactDOM from 'react-dom';

import HappoDebug from './HappoDebug';
import HappoDiffs from './HappoDiffs';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('react-root');
  if (window.APP_PROPS) {
    // We are on the review page
    ReactDOM.render(
      <HappoDiffs
        {...window.APP_PROPS}
      />,
      rootElement
    );
  } else {
    ReactDOM.render(
      <HappoDebug />,
      rootElement
    );
  }
});
