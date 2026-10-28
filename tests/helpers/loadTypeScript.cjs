const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');

// Compile local TS dependencies in memory; packages (including Zustand) stay real.
module.exports = function loadTypeScript(filename, cache = new Map()) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const nativeRequire = createRequire(filename);
  const localRequire = (id) => {
    if (id.startsWith('.')) {
      const candidate = path.resolve(path.dirname(filename), id);
      const tsFile = candidate.endsWith('.ts') ? candidate : `${candidate}.ts`;
      if (fs.existsSync(tsFile)) return loadTypeScript(tsFile, cache);
    }
    return nativeRequire(id);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  new Function('require', 'module', 'exports', '__filename', '__dirname', outputText)(
    localRequire, module, module.exports, filename, path.dirname(filename),
  );
  return module.exports;
};
