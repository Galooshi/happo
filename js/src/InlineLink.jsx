import React, { PropTypes } from 'react';

export default function InlineLink({ children, to }) {
  return (
    <a className='InlineLink' href={`#${to}`}>
      {children}
    </a>
  );
}
InlineLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
};
