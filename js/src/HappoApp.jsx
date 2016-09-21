import React from 'react';
import ReactDOM from 'react-dom';

import HappoDiffs from './HappoDiffs';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <HappoDiffs
      {...window.APP_PROPS}
    />,
    document.getElementById('react-root')
  );
});
