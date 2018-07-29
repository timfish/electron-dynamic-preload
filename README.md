# electron-dynamic-preload

### Sometimes it's handy to be able to pass parameters to Electron preload scripts

This module uses the
[`session.setPreloads()`](https://electronjs.org/docs/api/session#sessetpreloadspreloads)
API introduced in Electron 2.x.x. It won't work on older releases!

### `addPreloadWithParams(modulePath, exportName[, params, session])`

| Parameter  | Type             | Description                                     | Default                |
| ---------- | ---------------- | ----------------------------------------------- | ---------------------- |
| modulePath | string           | Path to file to load in preload                 |
| exportName | string           | Name of export to execute                       |                        |
| params     | any[]            | Parameters to pass to default exported function | []                     |
| session    | Electron.session | The session to add preload scripts to           | session.defaultSession |

#### Points to note:

- All `params` to the renderer are serialised so dont expect anything to make it
  through that doesn't survive `JSON.parse(JSON.stringify(data))`.

- Electron preload scripts are passed to the renderer via command line
  arguments. There is probably a limit to the amount of data that can be passed
  this way. If you have to look up this limit, you're probably attempting to
  pass something ridiculously large. **Do it another way!**

## Full Example

Say you want to make a library that allows you to set the background colour of
all `BrowserWindow`s from the main process (yes this is an oversimplified
example):

`script.js`

```javascript
import { addPreloadWithParams } from 'electron-dynamic-preload';

export function setBackgroundColor(color) {
  if (process.type === 'browser') {
    addPreloadWithParams(__filename, setBackgroundColor.name, arguments);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.style.backgroundColor = color;
    });
  }
}
```

`main.js`

```javascript
import { BrowserWindow, app } from 'electron';
import { setBackgroundColor } from './script';
import * as path from 'path';

// This call in the main process is all that's required!
setBackgroundColor('red');

app.on('ready', () => {
  var win = new BrowserWindow();
  win.loadURL(path.join(__dirname, 'index.html'));
});
```

## How Does It Work?

The Electron
[`session.setPreloads`](https://electronjs.org/docs/api/session#sessetpreloadspreloads)
API only lets us pass absolute paths as preload scripts. To get round this, we
append a magic string, the export name and the encoded parameters to ensure it
still looks like an absolute path.

The above example results in the following `--preload-scripts` argument being
passed to the renderer process.

`--preload-scripts="/user/me/my-app/node_modules/electron-dynamic-preload/dist/wrap-require;/user/me/my-app/script.js/edp-require-with-params/setBackgroundColor/%5B%22red%22%5D"`

`electron-dynamic-preload` ensures that the first preload script wraps
`require`. This ensures that subsequent preload scripts have the magic string
removed, parameters decoded and then pass them to the named export.

## FAQ

1.  Is this not super hacky and 🤮

    Yes, probably!
