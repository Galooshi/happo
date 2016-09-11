import { PropTypes } from 'react';

export default {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  diff: PropTypes.string,
  previous: PropTypes.string,
  current: PropTypes.string.isRequired,
};
