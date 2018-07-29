const { BrowserWindow, app } = require('electron');
const path = require('path');
const url = require('url');

const { setBackgroundColor } = require('./script');

app.on('ready', () => {
  setBackgroundColor('red');

  var win = new BrowserWindow();
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:'
    })
  );
});
