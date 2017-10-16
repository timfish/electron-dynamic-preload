
exports.setBackgroundColor = function setBackgroundColor(color) {
  if (process.type === 'renderer') {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  } else {
    return {
      renderScript: module.filename,
      renderScriptExport: setBackgroundColor.name,
      renderScriptArgs: [color]
    };
  }
};
