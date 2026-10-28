// React's production build omits act(). Select the test build before any
// React/renderer imports, even when the invoking shell is building a release.
// This preload applies only to test processes; APK bundling remains production.
process.env.NODE_ENV = 'test';
