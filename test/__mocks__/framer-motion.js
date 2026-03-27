const React = require('react');

function createMotionTag(tag) {
  return React.forwardRef(({ children, ...props }, ref) => React.createElement(tag, { ...props, ref }, children));
}

// Minimal subset used by this codebase: `motion.*` tags and `AnimatePresence`.
const motion = new Proxy(
  {},
  {
    get: (_target, prop) => createMotionTag(prop),
  },
);

function AnimatePresence({ children }) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = { motion, AnimatePresence };

