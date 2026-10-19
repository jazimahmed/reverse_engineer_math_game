# Expo compatibility assessment

Assessment date: 2026-10-19. The workspace now has an Expo SDK 58 app manifest in the repository root. The compatibility matrix below comes from Expo's SDK 58 documentation and the SDK's own `bundledNativeModules.json`.

## Selected package set

| Package | Selected version | Expo SDK 58 evidence |
|---|---:|---|
| `expo` | `~58.0.0` | SDK 58 release branch and template |
| `react` | `19.3.0` | SDK 58 targets React 19.3.0 |
| `react-native` | `0.88.0` | SDK 58 targets React Native 0.88.0 |
| `@react-native-async-storage/async-storage` | `2.2.0` | SDK 58 bundled native module |
| `react-native-reanimated` | `4.7.1` | SDK 58 bundled native module; install with `react-native-worklets` |
| `react-native-worklets` | `0.13.0` | SDK 58 bundled native module |
| `react-native-svg` | `15.16.0` | SDK 58 bundled native module |
| `zustand` | `5.0.15` | NPM package documents built-in TypeScript declarations and zero runtime dependencies |
| `typescript` | `~6.0.3` | SDK 58 blank TypeScript template |
| `@types/react` | `~19.3.0` | SDK 58 blank TypeScript template |

The installed Node version is `24.22.0`; Expo SDK 58 lists `22.13.x` as its minimum Node version. The SDK documentation describes the listed Expo-managed versions as the SDK target set; use `npx expo install` when packages are available to apply/verify that set.

## Verification status

- **Manifest alignment:** versions above match Expo SDK 58's official target matrix and bundled modules.
- **Dependency installation:** NOT VERIFIED. `npm install` attempted to access `https://registry.npmjs.org` and failed with `EACCES`; `node_modules` and `package-lock.json` were not produced.
- **Expo CLI dependency check:** NOT RUN; Expo CLI is not installed locally.
- **App typecheck/build:** NOT RUN; React Native/Expo types and native packages are unavailable.

Sources:

- [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/)
- [SDK 58 bundled native module versions](https://github.com/expo/expo/blob/sdk-58/packages/expo/bundledNativeModules.json)
- [SDK 58 blank TypeScript template](https://github.com/expo/expo/blob/sdk-58/templates/expo-template-blank-typescript/package.json)
- [Zustand on npm](https://www.npmjs.com/package/zustand)
