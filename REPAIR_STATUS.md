# Core gameplay repair status

## MG-4–MG-6 follow-up (2026-10-30)

### MG-4 — Colorful navigation for children

- Replaced formal home copy with a greeting, a clear “Start here: Addition” action, and colorful topic cards with large math symbols, short labels, and visible play arrows.
- Mode cards now explain the action in child-friendly language (“Missing number”, “Play with a friend”, “Beat the clock”) with a distinct picture/symbol and explicit start text. The underlying topic/mode routing is preserved.
- Added a warmer light palette, matching dark-theme tints, chunky buttons, written Back/Settings labels, and friendlier result/profile/settings copy. Cards remain scrollable and use text and symbols as well as color.
- Added rendered navigation coverage for every topic/mode in both themes. Native layout/child usability acceptance remains pending.

### MG-5 — Keep unfinished Equations inaccessible

- Equations is now disabled and labeled “Coming soon”, matching all seven upcoming mini-games. Its tile has no press handler and exposes its disabled state to accessibility services.
- Removed the Equations level/board registrations from the active navigator. Their implementation files are retained for future development, but the unfinished board is not a reachable app route.
- The hub explains that these puzzles are not ready, has a working “Back to number games” action, and no longer presents a nonfunctional sign-in crown.
- Added rendered checks for all eight disabled tiles, return navigation, and absence of both Equations routes.

### MG-6 — Original math-game icon

- Created an original smiling calculator mascot with mint, purple, yellow, pink, and blue colors and recognizable arithmetic buttons. The editable source is `src/assets/brand/calculator.svg`.
- Added a 1024px Expo icon, transparent adaptive foreground, and alpha-based monochrome icon. Configured `app.json` so future Expo prebuilds use the same artwork.
- Updated all ten existing Android standard/round launcher images across five densities. Added Android 8+ adaptive resources and Android 13+ themed-icon resources, plus a vector foreground and matching background color.
- Updated native splash images and the React splash to match. The native window background now centers the splash bitmap rather than stretching it across the screen.
- Added `tools/generate_app_icons.py` to reproduce 20 binary/vector resources from the SVG (Python + Pillow; no new app dependency). `--check` verifies committed output.

### MG-4–MG-6 verification

- `npm run typecheck`: passed.
- `CI=true NODE_ENV=production npm test`: **77 passed, 0 failures** on the local Windows host, including rendered navigation and upcoming-game route checks.
- `python tools/generate_app_icons.py --check`: all 20 generated resources match.
- Icon checks: Expo file paths resolve, all three Expo images are 1024×1024, all ten Android launcher sizes match their densities, and adaptive/monochrome artwork fits Android's central 66dp safe circle.
- Android SDK 37 `aapt2 compile --dir android/app/src/main/res`: passed for all app resources. This is resource compilation, not a complete Gradle APK build.
- Visually inspected the generated color and monochrome artwork as images; no launcher/device screenshots were taken.
- Android bundle export: passed with `npx expo export --platform android --max-workers 2`; 896 modules, 18 assets (including the new icon), and a production Hermes bundle emitted. The first attempt timed out during Metro startup; the two-worker retry completed.
- Remaining acceptance: installed-APK layout/font scaling, launcher masks/themed icons, physical navigation/touch behavior, and child usability review. No emulator or physical-device testing was performed.

## CI follow-up — React test environment

- Reproduced the reported `TypeError: app.act is not a function` locally by running a rendered menu test with `NODE_ENV=production`.
- Root cause: the Android workflow set production mode for the whole job, so React and its renderer loaded production builds without `act`. Earlier local checks did not reproduce that CI environment.
- Scoped `NODE_ENV=production` to the release APK build step. Added a Node test preload that selects `NODE_ENV=test` before imports, including when `npm test` inherits a production environment. No tests are skipped and `act` is not mocked.
- Verification: with inherited `CI=true` and `NODE_ENV=production`, `npm test` now passes all 75 tests (0 failures). `npm run typecheck` also passes. Verification was local on Windows with CI environment variables, not a completed GitHub Actions or device run.

## Follow-up Jira repairs (2026-10-28)

### MG-1 — Modern UI

- Added shared light/dark semantic colors, safe-area support, responsive cards, readable typography, and accessible buttons.
- Redesigned home, topic selection, answer screens, Duel, results, and startup. Removed the artificial 12-second splash and incorrect reference branding.
- Fixed wrapping topic/game/level grids and review-sheet touch dismissal. Shared answer UI retains retry/duplicate-answer guards.
- Validation: TypeScript passed; all 53 existing automated tests passed. Visual/device acceptance has not been performed.

### MG-2 — Working profile and settings

- Added a named local profile with persisted edits and a working home shortcut.
- Replaced the touch-dismissed settings overlay with usable appearance/vibration controls, restore preferences, confirmed progress reset, and Done/Android Back handling.
- Removed irrelevant language switching, nonfunctional audio toggles, and empty footer actions. Correct-answer vibration now follows its preference.
- Added in-game settings that pause/resume the same round; background/foreground changes do not resume gameplay underneath settings.
- Added real React-rendered tests (native/storage/navigation boundaries mocked) for profile navigation, preference persistence/rehydration, reset confirmation, pause/resume, modal Back, and vibration/duplicate input. These are not device tests.
- Validation: TypeScript passed; the focused menu tests pass. The added test-renderer dependency matches React 19.3.0.

### MG-3 — Correct topics and complete arithmetic modes

- Replaced the universal Addition fallback with an explicit validated topic/mode configuration. Unknown combinations show a recoverable unavailable screen without starting a session.
- Added subtraction, multiplication, exact non-zero-divisor division, unary square roots, scaled decimal arithmetic, and rational fraction arithmetic/labels. Missing-operand questions have unique solutions; answer generation uses a bounded candidate list rather than an unbounded random loop.
- Decimal operation tiles and Fraction addition/subtraction/multiplication/division select the requested operation. Hard raises difficulty; Exam uses one attempt per question.
- Replaced the unfinished Learn screen with ten worked examples and reveal/next/complete actions. Replaced unfinished Play with a working keypad, input validation, equivalent fraction answers, retries, and a ten-question completion flow. Their research/UNKNOWN banners are gone.
- Added topic/mode-scoped completion and best-score persistence. Results format roots/fractions/decimals correctly and distinguish wrong Exam answers from retries/timeouts and learned examples.
- Added 11 generator/configuration tests (4,500 seeded questions across 45 advertised arithmetic routes), plus six rendered gameplay tests. The rendered full-flow test completes all 45 routes, including Play, Learn, Duel, and Exam: 450 questions with result navigation and progress writes.

### Final follow-up verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | 75 passed, 0 failed |
| Rendered menu/settings tests | 5 passed; real React/Zustand, mocked native/navigation/storage boundaries |
| Rendered gameplay tests | 6 passed; includes all 45 arithmetic route combinations and 450 completed questions |
| Generator/configuration tests | 11 passed; includes 4,500 seeded questions, constant-RNG termination, invalid routes, equivalent fractions, and display formatting |
| Android production bundle export | Passed: `npx expo export --platform android --output-dir C:\Users\Administrator\AppData\Local\Temp\opencode\mg-jira-android-export`; 897 modules, Hermes bundle emitted |
| Physical device/emulator/native APK acceptance | Not performed |

The renderer emits its upstream deprecation notice; existing Node module-format warnings also remain non-fatal. The Android export validates production JavaScript bundling, not native APK compilation or installation.

### Remaining acceptance and scope

- Review the new appearance on real compact/large phones in both themes; React rendering does not measure native layout or font scaling.
- Verify installed-APK touch behavior, Android Back/navigation, vibration hardware, and storage after a real force-stop/relaunch.
- Audio playback and translation are not implemented; their misleading settings/menu controls were removed. The profile is explicitly local, without cloud sign-in.
- Learn is a guided-example mode and Play is a typed-answer mode. These are deliberate product implementations, not claims of exact reference-app behavior.
- The separate Games hub's unfinished Equations puzzle and disabled mini-games are outside these arithmetic repairs. Production signing/versioning also remains a separate release task.

The original core-repair record below is historical; the follow-up sections above supersede its resolved topic-routing, Play/Learn, menu, UI, and testing limitations.

**Date:** 2026-10-28

**Scope:** First repair pass from `PROJECT_REVIEW.md`: round progression, retry handling, scoring, and timeouts for the existing Addition-based Practice, Quiz, Test, Time, and Duel flows.

**Branch:** `fix/core-gameplay-rounds`

**Status:** Implemented and locally checked; Android device acceptance remains pending.

## Coordination and preservation

Two subagents worked concurrently with separate file ownership:

1. **Session agent:** `src/store/gameSessionStore.ts`, session tests, and their in-memory TypeScript loader.
2. **Interaction agent:** Practice, Quiz, Test, Time, and Duel components only.

The lead integrated and reviewed both changes, implemented the round controller and screen/result wiring, and added controller regression tests. Existing research logs, build-fix patch, package-lock backup, and other unrelated local work were not included in the repair changes. `PROJECT_REVIEW.md` is included as the baseline review, not rewritten to imply its findings have all been resolved.

## Fixes implemented

| Review issue | Repair | Verification |
|---|---|---|
| R01: round never advances/completes | Resolution and advancement are guarded store actions. Each advance replaces the question and increments its index atomically. Final transition ends at 10/10, with one completion callback. | Ten-question store/controller regression tests |
| R02: wrong answer locks retries | Wrong answers retain feedback but do not lock the question. Correct answers lock immediately with a ref, including repeated taps before a render. | Component code review; store/controller retry tests; native interaction testing pending |
| R03: timeout repeats question/passes limit | Timeout resolves once, records an unanswered history entry, loads the next question, resets the timer, and finishes at the round limit. | Full unattended 45-second virtual-clock round; boundary/race tests |
| R05: scoring and history | Store derives first-try status from prior wrong attempts. Practice/Quiz add one red on eventual retry success; Test/Time add red immediately once. One history row per resolved question. | Wrong/wrong/correct tests for all four modes; timeout with and without earlier wrong answer |
| R08: Duel duplicate scoring | First correct answer locks both players; store rejects later submissions; next question resets feedback. Existing cross-chip scoring is preserved. | Duplicate/simultaneous Duel submissions and bounded completion tests; component code review |
| R09: stale session/timer behavior | Session IDs and question indices reject stale events. Controller cancels callbacks on departure. Screen starts a fresh session on focus and pauses/resumes on AppState changes. Result replaces completed Game; Restart replaces Result; Exit returns to TopicSelect. | Disposal/restart/stale callback/pause tests; navigation wiring reviewed, native navigation pending |
| R13: solution exposed | Practice and Duel render `?` in the answer position. Quiz and True/False equation formats remain distinct. | Component code review |
| R16: conditional hook count | Effects execute before null-question returns; feedback timers clean up on question change/unmount. | Component code review and TypeScript check |
| R17: missing gameplay tests | Added 17 real-store tests and 10 controller tests using a deterministic clock. Existing domain tests retained. | 53 total tests pass |

The Result screen now displays Duel chip scores instead of ordinary green/red counters and labels unanswered history entries as timeouts.

## Explicit behavior choices

Some reference-app behavior remains unknown in the research specifications. These are implementation policies, not claims of verified reference parity:

- **First-try correct:** earns one green in Practice, Quiz, Test, and Time. Correct after a retry earns no green.
- **Practice/Quiz wrong attempts:** stay on the question; red is added once when eventually solved.
- **Test/Time wrong verdicts:** add red immediately once per question, remain retryable, and do not reset the timer.
- **Timeout:** counts as one red outcome. A preceding wrong verdict already counted red, so timeout does not add another. History records `userAnswer: null`, `correct: false`.
- **Time correct answer:** advances immediately. Other supported modes retain the existing 900 ms feedback transition, including on the final question.
- **At the deadline:** elapsed time is checked before accepting an answer. An expired question cannot receive a late answer, and its stale event cannot answer the newly loaded question.
- **Backgrounding:** timer and pending question transition pause. Foreground resumes the remaining question time; a paused feedback transition restarts its 900 ms delay.
- **Leaving the Game route:** ends that session and cancels its scheduled work. Re-entering/restarting creates a new session rather than silently resuming old progress.
- **Duel:** the first correct submission resolves the shared question; wrong submissions retain the existing cross-chip decrement behavior.

## Implementation map

- `src/store/gameSessionStore.ts`: authoritative score/history state, session identity, guarded answer/expiry/advance actions.
- `src/utils/gameRoundController.ts`: elapsed-time accounting, transition scheduling, completion callback, pause/resume/disposal.
- `src/screens/GameScreen.tsx`: controller lifecycle, AppState integration, captured question identity in callbacks, Result replacement.
- `src/components/{Practice,Quiz,Test,Time,Duel}View.tsx`: retry-friendly input, immediate resolution guards, feedback reset, unconditional hooks.
- `src/screens/ResultScreen.tsx`: clean restart/exit targets, Duel scores, timeout review labels.
- `tests/gameSession.test.mjs`: 17 store regression tests.
- `tests/gameRoundController.test.mjs`: 10 orchestration/virtual-clock regression tests.
- `tests/helpers/loadTypeScript.cjs`: compiles local TypeScript in memory; tests use the real Zustand store without mocking its mutations.

## Verification results

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | Passed: 53 tests, 0 failures (26 existing + 27 new) |
| `git diff --check` for repair files | Passed |
| Rendered component/native UI tests | Not performed; no component renderer is installed |
| Release APK build/install/device or emulator testing | Not performed during this repair |
| GitHub Actions build for this branch | Not run as part of the local verification; existing APK workflow is manually dispatched |

Existing Node module-type warnings from domain-test imports remain non-fatal. No dependency or lockfile changes were needed.

The automated tests establish the session and controller behavior. They do **not** establish correct native layout, touch dispatch, navigation animations, or Android background behavior. Those require testing the built APK.

## Remaining issues

- **R04:** Topic-specific generators and mode availability are still incorrect. Non-Addition topics and unsupported identifiers retain existing Addition fallbacks. This pass fixes the shared core loop, not the advertised topic coverage.
- **R06/R07:** Equations, Play, and Learn remain incomplete. Seven mini-games remain disabled previews.
- **R10:** Completion still does not update persistent topic/tier/level progress.
- **R11/R12:** Grid layout, narrow-screen geometry, and balanced Duel layout remain to be repaired.
- **R14:** Review-sheet touch dismissal and Android modal Back handling remain outstanding.
- **R15:** Utility actions, audio settings integration, and consistent Night mode remain incomplete.
- **R17 (partial):** CI now picks up the added Node tests through the existing test script, but no installed-release or rendered-component smoke suite exists.
- **R18/R19:** Production signing/versioning, research branding, startup delay, and historical documentation reconciliation remain outstanding.
- Native lifecycle/navigation and input behavior still need verification even for the repaired paths.

## Next APK acceptance pass

1. Complete ten questions in Practice/Quiz/Test with wrong → wrong → correct retries; check counts and one history entry per question.
2. Complete Time with no input, then with wrong/correct answers near expiry; verify new equations and exactly one Result transition.
3. Rapidly tap answers, including both Duel halves; check no duplicate score or skipped question.
4. Background during a timed question and during feedback; resume and check the documented pause policy.
5. Back out during feedback, re-enter, complete, Restart, Exit, and use Android Back; check for stale state and blank screens.
6. Confirm Practice/Duel hide the answer and every new question has usable controls.

Record the APK source commit/checksum, device, Android version, and actual results before marking device acceptance complete.
