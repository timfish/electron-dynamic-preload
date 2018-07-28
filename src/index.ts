import { session as electronSession } from 'electron';
import * as path from 'path';

/**
 *
 *
 * @param {string} modulePath
 * @param {any[]} [params=[]]
 * @param {Electron.session} [session=session.defaultSession]
 */
export function addPreloadWithParams(
  modulePath: string,
  params: any[] | IArguments = [],
  session: Electron.session = electronSession.defaultSession
) {
  ensureRequireWrapFirstPreload(session);

  // Ensure absolute path
  if (!path.isAbsolute(modulePath)) {
    modulePath = path.resolve(modulePath);
  }

  addPreload(
    path.join(
      modulePath,
      'edp-require-with-params',
      // we have to use spread if we want IArguments to be an array
      encodeURIComponent(JSON.stringify([...params]))
    ),
    session
  );
}

function addPreload(path: string, session: Electron.session) {
  const preloads = session.getPreloads();
  preloads.push(path);
  session.setPreloads(preloads);
}

function ensureRequireWrapFirstPreload(session: Electron.session) {
  const preloads = session.getPreloads();
  const wrapPath = path.join(__dirname, 'wrap-require');

  if (preloads.length === 0 || preloads[0] !== wrapPath) {
    preloads.unshift(wrapPath);
    session.setPreloads(preloads);
  }
}
