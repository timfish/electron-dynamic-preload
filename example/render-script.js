
exports.testing = function testing(color) {
  if (process.type === 'renderer') {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  } else {
    return {
      renderScript: module.filename,
      renderScriptExport: testing.name,
      renderScriptArgs: [color]
    };
  }
};
