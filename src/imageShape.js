import { PropTypes } from 'react';

export default {
  description: PropTypes.string.isRequired,
  viewportName: PropTypes.string.isRequired,
  previous: PropTypes.string,
  current: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired,
};
