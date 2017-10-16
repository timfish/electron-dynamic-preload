
# electron-dynamic-preload

Sometimes we'd like to dynamically set preload scripts from the main process and sometimes we want to pass parameters.

This module injects the code location and parameters through the BrowserWindow url hash and then runs the required code in preload in the renderer.

### Points to note

- All parameters are passed as JSON so dont expect anything that doesn't survive `JSON.parse(JSON.stringify(data))` to get passed safely.

- The url hash is probably limited to around 2k characters so even though an attempt has been made to minimise data sent, if you hit the limit it will probably break.


Sending config from the main process:

```javascript
const hash = ExecuteInRenderer.getWindowHash({
  renderScript: 'path/to/script/file',
  renderScriptExport: 'setBackgroundColor',
  renderScrtipArgs: ['#ff0000']
}, { /* as many as you like */ })

win.loadURL(url.format({
  pathname: './index.html',
  protocol: 'file:',
  slashes: true,
  hash: hash
}));
```
String paths and export names in files is generally a bad idea so see [below for an example](#render-scriptjs) of how to use `module.filename` and `someFunc.name`.

In your preload script simply:
```javascript
const { ExecuteInRenderer } = require('./dist/')
ExecuteInRenderer.preload();
```
Alternatively, use the pre-supplied preload script which does just that:
```
webPreferences: {
  preload: 'node_modules/electron-dynamic-preload/preload.js'
}
```

## Full Example

### index.js
```javascript
const { BrowserWindow, app } = require('electron');
const { ExecuteInRenderer } = require('electron-dynamic-preload');
const { setBackgroundColor } = require('./render-script')
const url = require('url');

let win;

app.on('ready', () => {
  win = new BrowserWindow({
    webPreferences: {
      preload: 'node_modules/electron-dynamic-preload/preload.js'
    }
  })

  const hash = ExecuteInRenderer.getWindowHash(setBackgroundColor('red'));

  win.loadURL(url.format({
    pathname: './index.html',
    protocol: 'file:',
    slashes: true,
    hash: hash
  }));
});
```

### render-script.js
```javascript
exports.setBackgroundColor = function setBackgroundColor(color) {
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

```
