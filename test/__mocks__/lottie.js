const React = require('react');

function Player({ src, autoplay, loop, style, ...rest }) {
  return React.createElement('div', {
    'data-testid': 'lottie-player',
    'data-src': src,
    'data-autoplay': autoplay ? 'true' : 'false',
    'data-loop': loop ? 'true' : 'false',
    style,
    ...rest,
  });
}

module.exports = { Player };

