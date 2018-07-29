const { addPreloadWithParams } = require('../dist/');

exports.setBackgroundColor = function setBackgroundColor(color) {
  if (process.type === 'browser') {
    addPreloadWithParams(__filename, setBackgroundColor.name, arguments);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  }
};
