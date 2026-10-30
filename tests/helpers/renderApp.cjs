const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const renderer = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;

// Real React + Zustand, with only native/platform boundaries replaced for Node.
module.exports = function renderApp(clock) {
  const cache = new Map();
  const storage = new Map();
  const calls = [];
  const alerts = [];
  const appListeners = new Set();
  const navigation = Object.fromEntries(['navigate', 'replace', 'popTo', 'goBack'].map((action) => [action, (...args) => calls.push([action, ...args])]));
  const context = { route: { params: { modeId: 'practice', topicId: 'addition' } } };
  const native = {
    View: 'View', Text: 'Text', TouchableOpacity: 'TouchableOpacity', Pressable: 'Pressable',
    ScrollView: 'ScrollView', TextInput: 'TextInput', Switch: 'Switch', SafeAreaView: 'SafeAreaView',
    Modal: ({ visible, children }) => visible ? React.createElement('Modal', null, children) : null,
    StyleSheet: { create: (styles) => styles },
    Alert: { alert: (...args) => alerts.push(args) },
    Vibration: { vibrate: (...args) => calls.push(['vibrate', ...args]) },
    AppState: { currentState: 'active', addEventListener: (_, listener) => {
      appListeners.add(listener); return { remove: () => appListeners.delete(listener) };
    } },
  };
  const mocks = {
    'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView', SafeAreaProvider: 'SafeAreaProvider' },
    '@react-navigation/native': {
      NavigationContainer: 'NavigationContainer', DarkTheme: {}, DefaultTheme: {},
      useNavigation: () => navigation,
      useRoute: () => context.route,
      useFocusEffect: (effect) => React.useEffect(effect, [effect]),
    },
    '@react-navigation/native-stack': {
      createNativeStackNavigator: () => ({ Navigator: 'Navigator', Screen: 'Screen' }),
    },
    '@react-native-async-storage/async-storage': {
      getItem: async (key) => storage.get(key) ?? null,
      setItem: async (key, value) => { storage.set(key, value); },
      removeItem: async (key) => { storage.delete(key); },
    },
  };
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const nativeRequire = createRequire(filename);
    function localRequire(id) {
      if (mocks[id]) return mocks[id];
      const alias = /^@(store|constants|components|screens|navigation|utils)\/(.*)$/.exec(id);
      const base = alias ? path.join(process.cwd(), 'src', alias[1], alias[2]) : id.startsWith('.') ? path.resolve(path.dirname(filename), id) : null;
      if (base) {
        if (base.endsWith('.json')) return nativeRequire(base);
        const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
        if (resolved) return load(resolved);
      }
      return nativeRequire(id);
    }
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    const ClockDate = clock ? class extends Date { static now() { return clock.now(); } } : Date;
    new Function('require', 'module', 'exports', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', outputText)(
      localRequire, module, module.exports, clock?.setTimeout ?? setTimeout, clock?.clearTimeout ?? clearTimeout,
      clock?.setInterval ?? setInterval, clock?.clearInterval ?? clearInterval, ClockDate,
    );
    return module.exports;
  }
  return { React, renderer, act: renderer.act, load, storage, calls, alerts, context, native,
    appState: (state) => { native.AppState.currentState = state; appListeners.forEach((listener) => listener(state)); } };
};
