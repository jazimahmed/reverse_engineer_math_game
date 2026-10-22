# Build an installable research APK

## Recommended: GitHub Actions

Commit these build fixes, including `package-lock.json` and
`.github/workflows/android-apk.yml`, to the repository's default branch.
Open GitHub → Actions → Build Android APK → Run workflow.
Keep `arm64-v8a,x86_64` for a modern ARM64 phone and the existing x86_64 emulator.
Select all four architectures only if you also need 32-bit devices.

After the job succeeds, download `math-games-research-apk-<run number>` from
the run's Artifacts section and extract `app-release.apk` from its ZIP.
The separate diagnostics artifact contains the build log, source commit, and
APK checksum. The job stops on failure and has a 60-minute maximum; this is
a limit, not a promised completion time. It does not retry the whole build.

This builds on GitHub's Linux runner, avoiding the Windows machine's DNS and
native long-path problems. It needs no Expo account or EAS token. Native build
success is still unverified until this workflow completes. The workflow uses
the project's configured Android versions and lets Gradle install missing SDK
components using the licenses accepted by setup-android.

The existing Android configuration signs release APKs with the checked-in
debug keystore. This is an installable research/testing build, not a production
signing setup. Bundled JavaScript is checked, but offline launch and fidelity
still need emulator/device verification.

## Windows local build

Use Node 24, a compatible JDK (the existing JDK 21 is suitable), and the Android
SDK. From the project root, with JAVA_HOME and SDK configuration already set:

```powershell
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
.\run_build.bat
```

Output: `android/app/build/outputs/apk/release/app-release.apk`.
The batch file uses its own directory, returns nonzero on failure, and builds
only `:app:assembleRelease` for ARM64 and x86_64. No emulator or Metro is needed
to build the APK. Use a short Windows checkout path if native path errors occur.

Keep the local cache; do not run clean or --refresh-dependencies routinely.
Do not use --offline until all required dependencies are cached. If downloads
fail again, use the GitHub workflow rather than repeating the same local build.
Do not use `tools/seed_missing.ps1` as the recovery path: it manually writes to
Gradle's cache, retries each download up to 30 times, and does not reject a file
after a checksum mismatch. Let Gradle resolve dependencies on a working network.

## Inspection findings (2026-10-22)

Base commit: `085dfa2157963fbd65d7555bf1c19f8f8c8702ac`.

- `research/gradle_fail.log`: React Native/Hermes Maven download failures;
  reported build duration 3h 11m 46s. These named tasks failing does not itself
  establish a Kotlin/C++ source error.
- `research/gradle_offline*.log`: missing lint/tooling artifacts in offline mode.
- `research/gradle_release.log`: capture ends during native compilation, with
  no final BUILD SUCCESSFUL marker. It does not prove an APK was produced.
- The native checkbox dependency is unused by app source. Removing it avoids
  autolinking/code generation for an unnecessary native package. Existing
  research checkbox files are preserved as evidence.
- Expo's compatibility check requested gesture-handler `~3.3.0`, while the
  original manifest requested `^3.4.0`; aligned to the installed SDK guidance.
- A dependency lockfile was absent from Git; added one for repeatable npm ci.
- Removed the local Google Maven mirror workaround. Fresh builds now use
  official Google/Maven Central repositories; this does not repair local DNS.
- The original batch file hardcoded an Administrator desktop path and did not
  reliably propagate failure. It now works from the checkout's actual location.

## Verification performed on the corrected source

- Dependency installation succeeded.
- `npm run typecheck`: passed.
- `npm test`: 26 passed, 0 failed.
- `npx expo install --check`: dependencies are up to date.
- `npx expo export --platform android --output-dir dist`: succeeded (890 modules,
  Hermes bundle and 17 assets exported).
- Workflow YAML parses; workflow execution is not yet verified.
- Native APK compilation and device launch: NOT RUN in this environment,
  which has no Android SDK/NDK installed. Runtime fidelity remains UNKNOWN.

Original research observations and milestone documents are unchanged.
