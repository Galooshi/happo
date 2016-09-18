import { PropTypes } from 'react';

export default {
  description: PropTypes.string.isRequired,
  viewport: PropTypes.string.isRequired,
  previous: PropTypes.string,
  current: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
};
