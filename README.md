# electron-dynamic-preload

### Sometimes its handy to be able to pass parameters to Electron preload scripts.

This module uses the
[`session.setPreloads()`](https://electronjs.org/docs/api/session#sessetpreloadspreloads)
API introduced in Electron 2.x.x. That means it won't work on anything older!

## `addPreloadWithParams(modulePath, params[, session])`

| Parameter  | Type             | Description                                     | Default                |
| ---------- | ---------------- | ----------------------------------------------- | ---------------------- |
| modulePath | string           | Path to file to load in preload                 |
| params     | any[]            | Parameters to pass to default exported function | []                     |
| session    | Electron.session | The session to add preload scripts to           | session.defaultSession |

### Points to note:

- All `params` to the renderer are serialised so dont expect anything to make it
  through that doesn't survive `JSON.parse(JSON.stringify(data))`.

- Electron preload scripts are passed to the renderer via command line
  arguments. There is probably a limit to the amount of data that can be passed
  this way. If you have to look up this limit, you're probably attempting to
  pass something ridiculously large. **Do it another way!**

## Full Example

Say you want to make a library that allows you to set the background colour of
`BrowserWindow`'s from the main process (yes this is an oversimplified example):

`script.js`

```javascript
const { addPreloadWithParams } = require('electron-dynamic-preload');

module.exports = function setBackgroundColor(color) {
  if (process.type === 'browser') {
    addPreloadWithParams(__filename, arguments);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  }
};
```

`main.js`

```javascript
const { BrowserWindow, app } = require('electron');
const path = require('path');
const url = require('url');

const setBackgroundColor = require('./script');

app.on('ready', () => {
  // This call in the main process is all that's required!
  setBackgroundColor('red');

  var win = new BrowserWindow();
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:'
    })
  );
});
```

## How Does It Work?

The Electron
[`session.setPreloads`](https://electronjs.org/docs/api/session#sessetpreloadspreloads)
API only lets you pass absolute paths as preload scripts. To get round this, we
append a magic string and then the encoded parameters and ensure it still looks
like a path.

The above example results in the following `--preload-scripts` being passed to
the renderer process.

```
--preload-scripts="C:\Users\tim\Documents\my-app\node_modules\electron-dynamic-preload\dist\wrap-require;C:\Users\tim\Documents\my-app\script.js\edp-require-with-params\%5B%22red%22%5D"
```

`electron-dynamic-preload` always ensures that the first preload script wraps
`require` so that that subsequent scripts can have the magic string removed and
parameters decoded!

## FAQ

1.  Is this not super hacky and 🤮

    Yes, probably!
