const { BrowserWindow, app } = require('electron');
const { ExecuteInRenderer } = require('../dist/');
const { setBackgroundColor } = require('./render-script')
const path = require('path');
const url = require('url');

app.on('ready', () => {
  var win = new BrowserWindow({
    webPreferences: { preload: path.resolve(__dirname, '../preload.js') }
  })

  const hash = ExecuteInRenderer.getWindowHash(setBackgroundColor('red'));

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    hash: hash
  }));
});


