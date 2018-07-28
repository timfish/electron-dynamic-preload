const { addPreloadWithParams } = require('../dist/');

module.exports = function setBackgroundColor(color) {
  if (process.type === 'browser') {
    addPreloadWithParams(__filename, arguments);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  }
};
