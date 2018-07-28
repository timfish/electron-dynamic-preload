import Module = require('module');
const origRequire = Module.prototype.require;

Module.prototype.require = function(name: string) {
  const match = name.match(/(.*)[\/\\]edp-require-with-params[\/\\](.*)/);
  if (match) {
    const module = origRequire.call(this, match[1]);
    module.apply(undefined, JSON.parse(decodeURIComponent(match[2])));
    return undefined;
  }

  return origRequire.call(this, name);
};
